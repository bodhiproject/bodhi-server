const _ = require('lodash');

const { startServer } = require('./server');
const { blockchainEnv } = require('./constants');

if (_.includes(process.argv, '--testnet')) {
  startServer(blockchainEnv.TESTNET);
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(blockchainEnv.MAINNET);
} else {
  throw Error('testnet or mainnet flag not found.');
}
