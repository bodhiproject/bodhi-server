const EventEmitter = require('events');

const { IPC_EVENT } = require('../constants');

class EmitterHelper {
  constructor() {
    this.emitter = new EventEmitter();
  }

  onServerStartError(error) {
    this.emitter.emit(IPC_EVENT.SERVER_START_ERROR, error);
  }

  onQtumError(error) {
    this.emitter.emit(IPC_EVENT.QTUMD_ERROR, error);
  }

  onQtumKilled() {
    this.emitter.emit(IPC_EVENT.QTUMD_KILLED);
  }

  onWalletEncrypted() {
    this.emitter.emit(IPC_EVENT.WALLET_ENCRYPTED);
  }

  onBackupWallet() {
    this.emitter.emit(IPC_EVENT.WALLET_BACKUP);
  }

  onImportWallet() {
    this.emitter.emit(IPC_EVENT.WALLET_IMPORT);
  }
}

module.exports = new EmitterHelper();
