const EventEmitter = require('events');

const { ipcEvent } = require('../constants');

let emitter;

function getEmitter() {
  if (!emitter) {
    emitter = new EventEmitter();
  }
  return emitter;
}

function onQtumError(error) {
  emitter.emit(ipcEvent.STARTUP_ERROR, error);
}

function onQtumKilled() {
  emitter.emit(ipcEvent.QTUMD_KILLED);
}

function onApiInitialized() {
  emitter.emit(ipcEvent.SERVICES_RUNNING);
}

function onWalletEncrypted() {
  emitter.emit(ipcEvent.ON_WALLET_ENCRYPTED);
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
