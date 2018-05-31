const EventEmitter = require('events');

const { ipcEvent } = require('../constants');

let emitter;

function getEmitter() {
  if (!emitter) {
    emitter = new EventEmitter();
  }
  return emitter;
}

function showSaveDialog() {
  emitter.emit(ipcEvent.WALLET_BACKUP);
}

function showImportDialog() {
  emitter.emit(ipcEvent.WALLET_IMPORT);
}

module.exports = {
  getEmitter,
  showSaveDialog,
  showImportDialog,
};
