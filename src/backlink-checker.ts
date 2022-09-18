import { URL } from 'url';
import * as cheerio from 'cheerio';
import * as request from "superagent";

export class BacklinkChecker {
  private baseUri: string = null;
  private alreadyChecked = [];

  setBaseUri(uri: string) {
    if (uri) {
      this.baseUri = uri
    }
    return
  }

  linkTransformer(endPoint: string) {
    if (endPoint.startsWith('http') || endPoint.startsWith('https')) {
      return endPoint
    }
    return new URL(endPoint.replace('#', ''), this.baseUri).href
  }

  async startChecking(url: string = this.baseUri) {
    if (this.alreadyChecked.includes(url)) return;


    this.alreadyChecked.push(url);
    try {
      const response = await request.get(url);
      const $ = cheerio.load(response.text);
      const links = $("a").map((i, link) => $(link).attr('href')).get();
      console.log({
        _website: [this.baseUri],
        _link: [url],
        _statusCode: [response.statusCode]
      });
      links.filter(lnk => this.linkTransformer(lnk).startsWith(this.baseUri)).forEach(link => {
        this.startChecking(this.linkTransformer(link));
      });
    } catch (err) {
      return
    }
  }
}
