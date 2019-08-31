const Client = require('../lib/Client');
const control = new Client(); 

control.connect({
  // replace with output of `node --inspect yourapp.js` 
  nodeWSEndpoint: 'ws://127.0.0.1:9229/3873bde3-0e04-4174-a1f1-1ae068b20544' 
}).then(async ({Debugger, Runtime, Profiler}) => {  

  await Runtime.enable();
  Runtime.getHeapUsage().then((result) => {
    console.log(result);
  });
  
}).catch((e) => {
  console.log(e);
});
