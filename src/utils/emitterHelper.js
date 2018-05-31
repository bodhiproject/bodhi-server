const EventEmitter = require('events');

const { ipcEvent } = require('../constants');

class Emitter {
  constructor() {
    this.emitter = new EventEmitter();
  }

  onQtumError(error) {
    this.emitter.emit(ipcEvent.STARTUP_ERROR, error);
  }

  onQtumKilled() {
    this.emitter.emit(ipcEvent.QTUMD_KILLED);
  }

  onApiInitialized() {
    this.emitter.emit(ipcEvent.SERVICES_RUNNING);
  }

  onWalletEncrypted() {
    this.emitter.emit(ipcEvent.ON_WALLET_ENCRYPTED);
  }

  onBackupWallet() {
    this.emitter.emit(ipcEvent.WALLET_BACKUP);
  }

  onImportWallet() {
    this.emitter.emit(ipcEvent.WALLET_IMPORT);
  }
}

module.exports = new Emitter();
