import { BacklinkChecker } from './backlink-checker';

const backLink = new BacklinkChecker([{
  _website: ['https://www.chalkboard.io/'],
}]);
backLink.startScan();

