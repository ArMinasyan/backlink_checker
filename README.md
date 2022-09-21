## About module
A simple module, which can use for checking all link status code, given links.
Below shows how to use the module 

## How to use
Firstly install module
```shell
yarn add @black_meteor/check-link-status
```

After installing use module, how presented in example.
```javascript 
const CheckLinkStatus = require('@black_meteor/check-link-status'); 
const check_link_status = new CheckLinkStatus(['https://example.com']) // Array of your links 
check_link_status.startScan().then(result => { 
    console.log(result) 
}) 
```
Result structure is:
```javascript
[{
  link: 'https://example.com/about',
  status: 200
},{
  link: 'https://example.com/home',
  status: 200
},{
  link: 'https://example.com/not-found',
  status: 404
}]
```
