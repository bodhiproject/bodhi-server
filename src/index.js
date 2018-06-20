const _ = require('lodash');

const { startServer } = require('./server');
const { blockchainEnv, execFile } = require('./constants');
const { getDevQtumExecPath } = require('./utils');

if (_.includes(process.argv, '--testnet')) {
  startServer(blockchainEnv.TESTNET, getDevQtumExecPath(execFile.QTUMD));
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(blockchainEnv.MAINNET, getDevQtumExecPath(execFile.QTUMD));
} else {
  throw Error('testnet or mainnet flag not found.');
}
