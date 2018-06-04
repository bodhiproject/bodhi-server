const _ = require('lodash');

const { startServer } = require('./server');
const { blockchainEnv } = require('./constants');
const Utils = require('./utils/utils');

if (_.includes(process.argv, '--testnet')) {
  startServer(blockchainEnv.TESTNET, Utils.getQtumPath());
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(blockchainEnv.MAINNET, Utils.getQtumPath());
} else {
  throw Error('testnet or mainnet flag not found.');
}
