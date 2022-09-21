const url = require("url");
const cheerio = require("cheerio");
const request = require("superagent");

class CheckLinkStatus {
  #baseUrls = [];
  #baseUrl = null;
  #seenUrls = {};
  #urlQueue = [];
  constructor(urls) {

    if (!urls.length) {
      throw new Error('URLs are required.');
    }
    this.#baseUrls = urls.map(uri => uri.endsWith('/') ? uri : `${uri}/`);
  }

  #getHost() {
    const { hostname } = url.parse(this.#baseUrl)
    return hostname;
  }

  async #getLinksFromPage(href = this.#baseUrl) {
    try {
      const { text, statusCode } = await request.get(href);
      if (href.includes(this.#getHost())) {
        const $ = cheerio.load(text);
        $('a').each((index, element) => {
          const href = $(element).attr('href');
          if ((href === null || href === void 0 ? void 0 : href.startsWith('https')) || (href === null || href === void 0 ? void 0 : href.startsWith('/'))) {
            const transformedLink = this.#linkTransformer(href);
            if (!this.#seenUrls[transformedLink]) {
              this.#urlQueue.push(transformedLink);
            }
          }
        });
      }
      return {
        status: statusCode
      };
    } catch (err) {
      return {
        status: err.response.statusCode || err.request.statusCode
      };
    }
  }

  #linkTransformer(endPoint) {
    return new url.URL(endPoint, this.#baseUrl).href;
  }

  async #scan(link) {
    this.#baseUrl = link;
    const output = [];
    await this.#getLinksFromPage();
    let nextLink = null, currentLink = null;

    while (this.#urlQueue.length > 0) {
      currentLink = this.#urlQueue[0];
      nextLink = this.#urlQueue[1];
      this.#seenUrls[currentLink] = true;
      const { status } = await this.#getLinksFromPage(nextLink);
      this.#urlQueue = this.#urlQueue.filter(href => href !== currentLink);
      output.push({
        link: currentLink,
        status
      });
    }
    return output;
  }

  async startScan() {
    const result = [];
    await (async () => {
      for (const link of this.#baseUrls) {
        console.log('Start scan: ', link)
        result.push(...await this.#scan(link));
        this.#seenUrls = {};
      }
    })();
    return result;
  }
}

module.exports = CheckLinkStatus
