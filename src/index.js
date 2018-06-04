const _ = require('lodash');

const { startServer } = require('./server');
const { blockchainEnv, execFile } = require('./constants');
const { getQtumPath } = require('./utils/utils');

if (_.includes(process.argv, '--testnet')) {
  startServer(blockchainEnv.TESTNET, getQtumPath(execFile.QTUMD));
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(blockchainEnv.MAINNET, getQtumPath(execFile.QTUMD));
} else {
  throw Error('testnet or mainnet flag not found.');
}
