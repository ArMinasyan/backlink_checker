import {BacklinkChecker} from './backlink-checker';

const backLink = new BacklinkChecker();
backLink.setBaseUri('https://www.referralcandy.com/');
backLink.startChecking().then(data => {
  console.log(data)
})
