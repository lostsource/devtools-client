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
    this._domainListeners = {};
  }

  _handleMessage(message) {
    if(message.id) {
      const resolver = this._resolvers[message.id];
      if(resolver) {
        resolver(message.result);
      }

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

  send(method) {
    const that = this;
    this._id++;
    this._connection.sendUTF(JSON.stringify({
      id: this._id,
      method
    }));

    return new Promise((resolve) => {
      this._resolvers[that._id] = resolve;
    });
  }
}

exports.Dispatcher = Dispatcher;