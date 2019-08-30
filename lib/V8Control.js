'use strict';

const WebSocketClient = require('websocket').client;
const EventEmitter = require('events');
const Domain = require('./Domain');
const Dispatcher = require('./Dispatcher').Dispatcher;
const http = require('http');

class V8Control extends EventEmitter {
  constructor() {
    super();
    this._ws = null;
    this._wsConn = null;
    this._dispatcher = null;
  }

  async connect(options = {}) {
    const that = this;
    this._ws = new WebSocketClient();

    if (typeof options.nodeWSEndpoint !== 'string') {
      throw new Error('missing nodeWSEndpoint');
    }

    return new Promise((resolve, reject) => {
      that._ws.on('connect', async (connection) => {
        const protocolDef = await that._getProtocolDefinition(options.nodeWSEndpoint);
        that._dispatcher = new Dispatcher(connection, protocolDef);

        const exposedDomains = {};

        protocolDef.domains.forEach(({domain}) => {
          exposedDomains[domain] = Domain.create(domain, that._dispatcher);
        });

        resolve(exposedDomains);
      });
      that._ws.on('connectFailed', (error) => {
        reject(error);
      });

      that._ws.connect(options.nodeWSEndpoint, []);
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

exports.control = V8Control;
