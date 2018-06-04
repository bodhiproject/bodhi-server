const EventEmitter = require('events');

const { ipcEvent } = require('../constants');

class Emitter {
  constructor() {
    this.emitter = new EventEmitter();
  }

  onQtumError(error) {
    this.emitter.emit(ipcEvent.QTUMD_ERROR, error);
  }

  onQtumKilled() {
    this.emitter.emit(ipcEvent.QTUMD_KILLED);
  }

  onServerStartError(error) {
    this.emitter.emit(ipcEvent.SERVER_START_ERROR, error);
  }

  onApiInitialized() {
    this.emitter.emit(ipcEvent.API_INITIALIZED);
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

module.exports = new Emitter();
