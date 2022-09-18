import {BacklinkChecker} from './backlink-checker';

const backLink = new BacklinkChecker();
backLink.setBaseUri('https://www.chalkboard.io/');
backLink.startChecking()

// backLink.startChecking('https://www.referralcandy.com/').then(data => {
//   console.log(data)
// })
