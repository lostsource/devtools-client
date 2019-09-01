# devtools-client
Provides DevTools API for instrumentation of Node and Chromium Debugger (experimental)

Refer to https://chromedevtools.github.io/devtools-protocol/v8/ for supported domains and commands


### Installation

`npm install devtools-client`

### Example

```
const Client = require('devtools-client');
const control = new Client(); 

control.connect({
  // replace with output from `node --inspect yourapp.js` 
  nodeWSEndpoint: 'ws://127.0.0.1:9229/66cafdb2-9e86-45a6-8079-0b765d585e31' 
}).then(async ({Debugger, Runtime, Profiler}) => {  

  // calling methods
  await Runtime.enable();
  Runtime.getHeapUsage().then((result) => {
    console.log(result);
  });
  
  // listening for events
  Debugger.on('scriptParsed', ({url}) => {
  	console.log(url);
  });
  await Debugger.enable();  
  
}).catch((e) => {
  console.log(e);
});
