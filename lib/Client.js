'use strict';

const WS = require('ws');
const EventEmitter = require('events');
const Domain = require('./Domain');
const Dispatcher = require('./Dispatcher').Dispatcher;
const http = require('http');
const {spawn} = require('child_process');
const nodeExecutable = process.execPath;

class DevToolsClient extends EventEmitter {
  constructor() {
    super();
    this._ws = null;
    this._wsConn = null;
    this._dispatcher = null;
  }

  async launch(scriptPath) {
    const subProcess = spawn(nodeExecutable, [
      '--inspect',
      scriptPath,
    ]);

    const debuggerWs = await waitForWSAddress(subProcess);
    return this.connect({nodeWSEndpoint: debuggerWs});
  }

  async connect(options = {}) {
    const that = this;
    if (typeof options.nodeWSEndpoint !== 'string') {
      throw new Error('missing nodeWSEndpoint');
    }

    this._ws = new WS(options.nodeWSEndpoint);

    return new Promise((resolve, reject) => {
      that._ws.on('open', async () => {
        const protocolDef = await that._getProtocolDefinition(options.nodeWSEndpoint);
        that._dispatcher = new Dispatcher(that._ws, protocolDef);

        const exposedDomains = {};

        protocolDef.domains.forEach(({domain}) => {
          exposedDomains[domain] = Domain.create(domain, that._dispatcher);
        });

        resolve(exposedDomains);
      });
      that._ws.on('error', (error) => {
        reject(error);
      });      
    });
  }

  async _getProtocolDefinition(endpoint) {
    const {host} = new URL(endpoint);
    const protocolURL = `http://${host}/json/protocol`;
    return new Promise((resolve) => {
      http.get(protocolURL, (req) => {
        let response = '';
        req.on('data', (chunk) => {
          response += chunk.toString();
        });

        req.on('end', () => {
          resolve(JSON.parse(response));
        });
      });
    });
  }
}

const waitForWSAddress = (subProcess) => {
  let data = '';
  let resolver = null;
  const onData = (chunk) => {
    data += chunk.toString();
    // data comes in chunks, ws address might be split in separate lines
    data.split(' ').forEach((datapart) => {
      try {
        const wsURL = new URL(datapart);
        if (wsURL.protocol !== 'ws:') {
          return false;
        }

        // wait until a pathname is present
        // we will connect to the websocket host
        // and retrieve the ws endpoint via http request
        if (!wsURL.pathname || wsURL.pathname.length < 2) {
          return false;
        }

        const wsListURL = `http://${wsURL.host}/json/list`;
        http.get(wsListURL, (req) => {
          let response = '';
          req.on('data', (chunk) => {
            response += chunk.toString();
          });

          req.on('end', () => {
            const wsList = JSON.parse(response);
            resolver(wsList[0].webSocketDebuggerUrl);
          });
        });
      }
      catch (e) {};
    });
  };

  subProcess.stderr.on('data', onData);
  return new Promise((resolve) => {
    resolver = resolve;
  });
};

module.exports = DevToolsClient;
