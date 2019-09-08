# NodeJS DevTools Client

This module simplifies access to the [DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) which can be used to control NodeJS, Chrome or Chromium.

If you're simply looking to control Chrome or Chromium I suggest using [Puppeteer](https://github.com/GoogleChrome/puppeteer) as it provides a simpler, higher level API.

### Installation
```
npm install devtools-client
```
### Usage
The module can launch a user specified NodeJS script or connect to an existent DevTools session.

#### Launch Node Script and attach to the Debugger
```
const DevToolsClient = require('devtools-client');
const Controller = new DevToolsClient();

Controller.launch('/path/to/some.js').then(({Debugger, Profiler, Runtime}) => {
  // resolves with an object containing all available DevTools domains
});
```
#### Connect to an existent Debugger session
1. Launch your Node script with the `--inspect`  argument
```
$ node --inspect some.js
Debugger listening on ws://127.0.0.1:9229/08f8c820-28e7-43b1-b6f6-c39f170e489d
For help, see: https://nodejs.org/en/docs/inspector
```
2. Set the `nodeWSEndpoint` property to the WebSocket URL 
```
const DevToolsClient = require('devtools-client');
const Controller = new DevToolsClient();

Controller.connect({
  nodeWSEndpoint: 'ws://127.0.0.1:9229/08f8c820-28e7-43b1-b6f6-c39f170e489d'	
}).then(({Debugger, Runtime, Profiler}) => {
  // resolves with an object containing all available DevTools domains
});
```
### Quick Example
Retrieve all script sources loaded
This example [enables](https://chromedevtools.github.io/devtools-protocol/v8/Debugger#method-enable) the Debugger domain and listens to [`scriptParsed`](https://chromedevtools.github.io/devtools-protocol/v8/Debugger#event-scriptParsed) events
```
const DevToolsClient = require('devtools-client');
const Controller = new DevToolsClient();

Controller.launch('/path/to/some.js').then(async ({Debugger}) => {
  Debugger.on('scriptParsed', ({scriptId, url}) => {
    console.log(url);  
  });
  Debugger.enable();
});
```

### Methods
Due to the asynchronous nature of the DevTools protocol, all methods return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Events
Protocol events are emitted using the standard NodeJS [Event Emitter](https://nodejs.org/api/events.html).
