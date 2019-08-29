# V8-control
Provides NodeJS API for instrumentation of the V8 Debugger (experimental)

Refer to https://chromedevtools.github.io/devtools-protocol/v8/ for supported domains and commands

Example:

```

const V8Control = require('lib/V8Control').control;
const control = new V8Control(); 

control.connect({
  // replace with output of `node --inspect yourapp.js` 
  nodeWSEndpoint: 'ws://127.0.0.1:9229/66cafdb2-9e86-45a6-8079-0b765d585e31' 
}).then(async ({Debugger, Runtime, Profiler}) => {  

  await Runtime.enable();
  Runtime.getHeapUsage().then((result) => {
    console.log(result);
  });
  
}).catch((e) => {
  console.log(e);
});
