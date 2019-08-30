'use strict';

const EventEmitter = require('events');

class Domain extends EventEmitter {
  constructor(namespace, dispatcher) {
    super();
    const that = this;

    this._debuggerId = null;

    dispatcher.registerDomainListener(namespace, (prop, params) => {
      that.emit(prop, params);
    });

    const commandNames = dispatcher.getDomainCommandNames(namespace);
    const exposedMethods = {};
    commandNames.forEach((commandName) => {
      exposedMethods[commandName] = async (params) => {
        return dispatcher.send(namespace, commandName, params);
      };
    });

    return new Proxy(this, {
      get: function(target, property, receiver) {
        if (exposedMethods[property]) {
          return exposedMethods[property];
        }

        if (property === 'on') {
          return that.on;
        }
      }
    });
  }
}

exports.create = (...args) => {
  return new Domain(...args);
};
