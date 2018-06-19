module.exports = {
  blockchainEnv: {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
  },

  ipcEvent: {
    SERVER_START_ERROR: 'server-start-error',
    QTUMD_ERROR: 'qtumd-error',
    QTUMD_KILLED: 'qtumd-killed',
    API_INITIALIZED: 'api-initialized',
    WALLET_ENCRYPTED: 'wallet-encrypted',
    WALLET_BACKUP: 'wallet-backup',
    WALLET_IMPORT: 'wallet-import',
  },

  txState: {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
  },

  execFile: {
    QTUMD: 'qtumd',
    QTUM_QT: 'qtum-qt',
    QTUM_CLI: 'qtum-cli',
  },

  phase: {
    BETTING: 'betting',
    VOTING: 'voting',
    RESULT_SETTING: 'resultSetting',
    PENDING: 'pending',
    FINALIZING: 'finalizing',
    WITHDRAWING: 'withdrawing',
  },

  BLOCK_0_TIMESTAMP: 1504695029,
  SATOSHI_CONVERSION: 10 ** 8,
};
