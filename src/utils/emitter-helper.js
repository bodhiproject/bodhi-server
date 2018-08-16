const EventEmitter = require('events');

const { ipcEvent } = require('../constants');

class EmitterHelper {
  constructor() {
    this.emitter = new EventEmitter();
  }

  onServerStartError(error) {
    this.emitter.emit(ipcEvent.SERVER_START_ERROR, error);
  }

  onQtumError(error) {
    this.emitter.emit(ipcEvent.QTUMD_ERROR, error);
  }

  onQtumKilled() {
    this.emitter.emit(ipcEvent.QTUMD_KILLED);
  }

  onWalletEncrypted() {
    this.emitter.emit(ipcEvent.WALLET_ENCRYPTED);
  }

  onBackupWallet() {
    this.emitter.emit(ipcEvent.WALLET_BACKUP);
  }

  onImportWallet() {
    this.emitter.emit(ipcEvent.WALLET_IMPORT);
  }
}

module.exports = new EmitterHelper();
