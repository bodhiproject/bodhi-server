const { spawn } = require('child_process');
const _ = require('lodash');

const { isMainnet } = require('./config/config');
const Utils = require('./utils/utils');
const { getLogger } = require('./utils/logger');
const { execFile } = require('./constants');

/*
* Shuts down the already running qtumd and starts qtum-qt.
* @param qtumqtPath {String} The full path to the qtum-qt binary.
*/
function startQtumWallet(qtumqtPath) {
  if (_.isEmpty(qtumqtPath)) {
    throw Error('qtumqtPath cannot be empty.');
  }

  // Construct flags
  const flags = ['-logevents'];
  if (!isMainnet()) {
    flags.push('-testnet');
  }

  // Start qtum-qt
  getLogger().debug(`qtum-qt dir: ${qtumqtPath}`);

  const qtProcess = spawn(qtumqtPath, flags, {
    detached: true,
    stdio: 'ignore',
  });
  qtProcess.unref();
  getLogger().debug(`qtum-qt started on PID ${qtProcess.pid}`);

  // Kill backend process after qtum-qt has started
  setTimeout(() => process.exit(), 2000);
}

module.exports = {
  startQtumWallet,
};
