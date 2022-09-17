import { URL } from 'url';
import { IOutput } from "./type";
import * as cheerio from 'cheerio';
import axios from 'axios'

export class BacklinkChecker {
  private baseUri: string = null;
  private output: IOutput[] = [];

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
    return new URL(endPoint, this.baseUri).href
  }


  async startChecking() {
    const res = await axios.get(this.baseUri);
    const $ = cheerio.load(res.data);
    let singleStatus: IOutput = {
      _website: [],
      _link: [],
      _statusCode: []
    };
    for (let a of $('a')) {
      const link = this.linkTransformer($(a).attr('href'))
      singleStatus._website.push(this.baseUri)
      singleStatus._link.push(link);

      try {
        const res = await axios.get(link);
        singleStatus._statusCode.push(res.status)
      } catch (err) {
        singleStatus._statusCode.push(err.response.status)
      }

      this.output.push(singleStatus);
      singleStatus = {
        _website: [],
        _link: [],
        _statusCode: []
      }
    }

    return this.output
  }
}
