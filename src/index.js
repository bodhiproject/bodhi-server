const _ = require('lodash');

const { startServer } = require('./server');
const { blockchainEnv } = require('./constants');
const { getDevQtumExecPath } = require('./utils');

if (_.includes(process.argv, '--testnet')) {
  startServer(blockchainEnv.TESTNET, getDevQtumExecPath());
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(blockchainEnv.MAINNET, getDevQtumExecPath());
} else {
  throw Error('testnet or mainnet flag not found.');
}
