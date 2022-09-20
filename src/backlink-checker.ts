import { parse, URL } from 'url';
import * as cheerio from 'cheerio';
import * as request from "superagent";
import { IInput, IOutput } from "./type";

export class BacklinkChecker {
  constructor(uris: IInput[]) {
    if (!uris.length) {
      throw new Error('URIs are required.')
    }

    this.baseUris = uris.map(uri => uri._website[0].endsWith('/') ? uri._website[0] : `${uri._website[0]}/`)
  }

  private readonly baseUris: string[] = [];
  private baseUri: string = null;
  private seenUrls: string[] = [];
  private urlQueue: string[] = [];


  private getHost(): string {
    const { hostname } = parse(this.baseUri);
    return hostname
  }

  private async getLinksFromPage(href: string = this.baseUri): Promise<{ status: number }> {
    try {
      const { text, statusCode } = await request.get(href);
      if (href.includes(this.getHost())) {
        const $ = cheerio.load(text);
        $('a').each((index, element) => {
          const href = $(element).attr('href');
          if (href?.startsWith('https') || href?.startsWith('/')) {
            const transformedLink = this.linkTransformer(href);
            if (!this.seenUrls.includes(transformedLink)) {
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

  private linkTransformer(endPoint: string): string {
    return new URL(endPoint, this.baseUri).href
  }

  private async scan(link: string): Promise<IOutput[]> {
    this.baseUri = link;
    const output: IOutput[] = []
    await this.getLinksFromPage();
    let nextLink = null,
      currentLink = null;
    while (this.urlQueue.length > 0) {
      currentLink = this.urlQueue[0];
      nextLink = this.urlQueue[1];
      this.seenUrls.push(currentLink);
      const { status } = await this.getLinksFromPage(nextLink);
      this.urlQueue = this.urlQueue.filter(href => href !== currentLink)
      output.push({
        _website: [this.baseUri],
        _link: [currentLink],
        _statusCode: [status]
      })
    }

    return output
  }

  async startScan(): Promise<void> {
    const result = [];
    await (async () => {
      for (const link of this.baseUris) {
        console.log('Start scanning: ', link)
        result.push(...await this.scan(link));
        console.log('Finish scanning: ', link)
      }
    })()

    console.log(result);
  }
}
