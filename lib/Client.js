'use strict';

const WS = require('ws');
const EventEmitter = require('events');
const Domain = require('./Domain');
const Dispatcher = require('./Dispatcher').Dispatcher;
const http = require('http');

class DevToolsClient extends EventEmitter {
  constructor() {
    super();
    this._ws = null;
    this._wsConn = null;
    this._dispatcher = null;
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

module.exports = DevToolsClient;
