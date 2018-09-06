module.exports = {
  BLOCKCHAIN_ENV: {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    REGTEST: 'regtest',
  },

  IPC_EVENT: {
    SERVER_START_ERROR: 'server-start-error',
    QTUMD_ERROR: 'qtumd-error',
    QTUMD_KILLED: 'qtumd-killed',
    WALLET_ENCRYPTED: 'wallet-encrypted',
    WALLET_BACKUP: 'wallet-backup',
    WALLET_IMPORT: 'wallet-import',
  },

  BIN_TYPE: {
    QTUMD: 'qtumd',
    QTUM_QT: 'qtum-qt',
    QTUM_CLI: 'qtum-cli',
  },

  STATUS: {
    CREATED: 'CREATED',
    VOTING: 'VOTING',
    WAITRESULT: 'WAITRESULT',
    OPENRESULTSET: 'OPENRESULTSET',
    PENDING: 'PENDING',
    WITHDRAW: 'WITHDRAW',
  },

  PHASE: {
    BETTING: 'betting',
    VOTING: 'voting',
    RESULT_SETTING: 'resultSetting',
    PENDING: 'pending',
    FINALIZING: 'finalizing',
    WITHDRAWING: 'withdrawing',
  },

  WITHDRAW_TYPE: {
    ESCROW: 'ESCROW',
    WINNINGS: 'WINNINGS',
  },

  TOKEN: {
    QTUM: 'QTUM',
    BOT: 'BOT',
  },

  TX_TYPE: {
    APPROVECREATEEVENT: 'APPROVECREATEEVENT',
    CREATEEVENT: 'CREATEEVENT',
    BET: 'BET',
    APPROVESETRESULT: 'APPROVESETRESULT',
    SETRESULT: 'SETRESULT',
    APPROVEVOTE: 'APPROVEVOTE',
    VOTE: 'VOTE',
    FINALIZERESULT: 'FINALIZERESULT',
    WITHDRAW: 'WITHDRAW',
    WITHDRAWESCROW: 'WITHDRAWESCROW',
    TRANSFER: 'TRANSFER',
    RESETAPPROVE: 'RESETAPPROVE',
  },

  TX_STATE: {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
  },

  SATOSHI_CONVERSION: 10 ** 8,
};
