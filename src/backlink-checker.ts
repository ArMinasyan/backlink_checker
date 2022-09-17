import {URL} from 'url';

export class BacklinkChecker {

  private baseUri: string = null;

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
}
