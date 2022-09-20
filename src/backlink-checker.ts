import { parse, URL } from 'url';
import * as cheerio from 'cheerio';
import * as request from "superagent";
import { IInput, IOutput } from "./type";

export class BacklinkChecker {
  constructor(urls: IInput[]) {
    if (!urls.length) {
      throw new Error('URLs are required.')
    }

    this.baseUrls = urls.map(uri => uri._website[0].endsWith('/') ? uri._website[0] : `${uri._website[0]}/`)
  }

  private readonly baseUrls: string[] = [];
  private baseUrl: string = null;
  private seenUrls: {string?: boolean}= {};
  private urlQueue: string[] = [];


  // Return hostname from URI
  private getHost(): string {
    const { hostname } = parse(this.baseUrl);
    return hostname
  }

  // Method for getting links from single page
  private async getLinksFromPage(href: string = this.baseUrl): Promise<{ status: number }> {
    try {
      const { text, statusCode } = await request.get(href);
      if (href.includes(this.getHost())) {
        const $ = cheerio.load(text);
        $('a').each((index, element) => {
          const href = $(element).attr('href');
          if (href?.startsWith('https') || href?.startsWith('/')) {
            const transformedLink = this.linkTransformer(href);
            if (!this.seenUrls[transformedLink]) {
              this.urlQueue.push(transformedLink)
            }
          }
        });
      }

      return {
        status: statusCode
      }
    } catch (err) {
      return {
        status: err.response.statusCode || err.request.statusCode
      }
    }

  }

  // Transform endPoint to normalized link, base on main URI
  private linkTransformer(endPoint: string): string {
    return new URL(endPoint, this.baseUrl).href
  }

  // This method return result for single URI
  private async scan(link: string): Promise<IOutput[]> {
    this.baseUrl = link;
    const output: IOutput[] = []
    await this.getLinksFromPage();
    let nextLink = null,
      currentLink = null;
    while (this.urlQueue.length > 0) {
      currentLink = this.urlQueue[0];
      nextLink = this.urlQueue[1];
      this.seenUrls[currentLink] = true
      const { status } = await this.getLinksFromPage(nextLink);
      this.urlQueue = this.urlQueue.filter(href => href !== currentLink)
      output.push({
        _website: [this.baseUrl],
        _link: [currentLink],
        _statusCode: [status]
      })
    }

    return output
  }

 // Start method
  async startScan(): Promise<void> {
    const result = [];
    await (async () => {
      for (const link of this.baseUrls) {
        console.log('Start scanning: ', link)
        result.push(...await this.scan(link));
        this.seenUrls = {};
        console.log('Finish scanning: ', link)
      }
    })()

    console.log(result);
  }
}
