const events = require('events');

const emitter = new events.EventEmitter();

/**
 * Adds a listener to the event emitter.
 * @param {string} event Event name to bind the listener to.
 * @param {function} listener Callback to exec when the event happens.
 */
const addListener = (event, listener) => {
  if (!event) throw Error('Event name is undefined');
  if (!listener) throw Error('Event listener is undefined');
  emitter.addListener(event, listener);
};

/**
 * Removes a listener from the event emitter.
 * @param {string} event Event name to remove the listener for.
 * @param {function} listener Callback to remove when the event happens.
 */
const removeListener = (event, listener) => {
  if (!event) throw Error('Event name is undefined');
  if (!listener) throw Error('Event listener is undefined');
  emitter.removeListener(event, listener);
};

module.exports = {
  emitter,
  addListener,
  removeListener,
};
