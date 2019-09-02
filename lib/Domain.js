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

    exposedMethods.on = (...args) => {
      return that.on(...args);
    };

    return exposedMethods;
  }
}

exports.create = (...args) => {
  return new Domain(...args);
};
