class Dispatcher {
  constructor(connection, protocol) {
    const that = this;
    this._connection = connection;
    this._id = 0;
    this._protocol = protocol;
    this._connection.on('message', (msg) => {
      if(msg.type !== 'utf8') {
        return false;
      }

      that._handleMessage(JSON.parse(msg.utf8Data))
    });

    this._resolvers = {};
    this._rejectors = {};
    this._domainListeners = {};
  }

  _handleMessage(message) {

    if(message.id) {
      if(message.error) {
        const rejector = this._rejectors[message.id];
        if(rejector) {
          rejector(message.error);
        }
      }
      else {
        const resolver = this._resolvers[message.id];
        if(resolver) {
          resolver(message.result);
        }
      }

      delete this._resolvers[message.id];
      delete this._rejectors[message.id];
      return true;
    }

    const method = message.method;
    const dotIndex = method.indexOf('.');
    const domain = method.substr(0, dotIndex);
    const prop = method.substr(dotIndex + 1);

    if(this._domainListeners[domain]) {
      const handlers = this._domainListeners[domain];
      handlers.forEach((handler) => {
        handler(prop, message.params);
      });
    }
  }

  registerDomainListener(name, handler) {
    this._domainListeners[name] = this._domainListeners[name] || [];
    this._domainListeners[name].push(handler);
  }

  getDomainCommands(name) {
    const {commands} = this.getDomainDefinition(name);
    const names = [];
    commands.forEach(({name}) => {
      names.push(name);
    });
    return names;
  }

  getDomainDefinition(name) {
    const {domains} = this._protocol;
    for(let x = 0; x < domains.length; x++) {
      let def = domains[x];
      if(def.domain === name) {
        return def;
      }
    }
    
    return null;
  }

  send(method, params = {}) {
    const that = this;
    this._id++;
    this._connection.sendUTF(JSON.stringify({
      id: this._id,
      method, params
    }));

    return new Promise((resolve, reject) => {
      this._resolvers[that._id] = resolve;
      this._rejectors[that._id] = reject;
    });
  }
}

exports.Dispatcher = Dispatcher;