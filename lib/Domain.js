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
    commandNames.forEach((commandName) => {
      that[commandName] = async (params) => {
        return dispatcher.send(namespace, commandName, params);
      };
    });
  }
}

exports.create = (...args) => {
  return new Domain(...args);
};
