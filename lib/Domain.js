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

    const eventNames = dispatcher.getDomainEventNames(namespace);
    this.on('newListener', (evName) => {
      // issue warning if domain does not have such event
      if (!eventNames.includes(evName)) {
        console.log(`WARN: '${namespace}' does not emit the '${evName}' event`);
      }
    });
  }
}

exports.create = (...args) => {
  return new Domain(...args);
};
