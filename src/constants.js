module.exports = {
  BLOCKCHAIN_ENV: {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
  },

  EVENT_STATUS: {
    CREATED: 'CREATED',
    BETTING: 'BETTING',
    ORACLE_RESULT_SETTING: 'ORACLE_RESULT_SETTING',
    OPEN_RESULT_SETTING: 'OPEN_RESULT_SETTING',
    ARBITRATION: 'ARBITRATION',
    WITHDRAWING: 'WITHDRAWING',
  },

  TX_TYPE: {
    CREATE_EVENT: 'CREATE_EVENT',
    BET: 'BET',
    SET_RESULT: 'SET_RESULT',
    VOTE: 'VOTE',
    WITHDRAW: 'WITHDRAW',
    TRANSFER: 'TRANSFER',
  },

  TX_STATE: {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
  },

  SATOSHI_CONVERSION: 10 ** 8,
  INVALID_RESULT_INDEX: 255,
};
