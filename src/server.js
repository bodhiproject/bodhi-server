const _ = require('lodash');
const { spawn, spawnSync } = require('child_process');
const fetch = require('node-fetch');
const portscanner = require('portscanner');

const { execFile } = require('./constants');
const {
  Config, setQtumEnv, getQtumPath, isMainnet, getRPCPassword,
} = require('./config');
const { initDB } = require('./db');
const { initLogger, getLogger } = require('./utils/logger');
const EmitterHelper = require('./utils/emitterHelper');
const { startSync } = require('./sync');
const { getInstance } = require('./qclient');
const initApiServer = require('./route');
const Wallet = require('./api/wallet');

const walletEncryptedMessage = 'Your wallet is encrypted. Please use a non-encrypted wallet for the server.';

let qtumProcess;
let encryptOk = false;
let isEncrypted = false;
let checkInterval;
let checkApiInterval;
let shutdownInterval;

/*
* Shuts down the already running qtumd and starts qtum-qt.
* @param qtumqtPath {String} The full path to the qtum-qt binary.
*/
function startQtumWallet() {
  // Start qtum-qt
  const qtumqtPath = `${getQtumPath()}/${execFile.QTUM_QT}`;
  getLogger().debug(`qtum-qt dir: ${qtumqtPath}`);

  // Construct flags
  const flags = ['-logevents'];
  if (!isMainnet()) {
    flags.push('-testnet');
  }

  const qtProcess = spawn(qtumqtPath, flags, {
    detached: true,
    stdio: 'ignore',
  });
  qtProcess.unref();
  getLogger().debug(`qtum-qt started on PID ${qtProcess.pid}`);

  // Kill backend process after qtum-qt has started
  setTimeout(() => process.exit(), 2000);
}

function getQtumProcess() {
  return qtumProcess;
}

// Checks to see if the qtumd port is still in use
function checkQtumPort() {
  const port = isMainnet() ? Config.RPC_PORT_MAINNET : Config.RPC_PORT_TESTNET;
  portscanner.checkPortStatus(port, Config.HOSTNAME, (err, status) => {
    if (err) {
      getLogger().error(`Error: qtumd: ${err.message}`);
    }
    if (status === 'closed') {
      clearInterval(shutdownInterval);

      // Slight delay before sending qtumd killed signal
      setTimeout(() => EmitterHelper.onQtumKilled(), 1500);
    } else {
      getLogger().debug('Waiting for qtumd to shut down.');
    }
  });
}

/*
* Kills the running qtum process using the stop command.
* @param emitEvent {Boolean} Flag to emit an event when qtum is fully shutdown.
*/
function killQtumProcess(emitEvent) {
  if (qtumProcess) {
    const flags = [`-rpcuser=${Config.RPC_USER}`, `-rpcpassword=${getRPCPassword()}`];
    if (!isMainnet()) {
      flags.push('-testnet');
    }
    flags.push('stop');

    const qtumcliPath = `${getQtumPath()}/${execFile.QTUM_CLI}`;
    const res = spawnSync(qtumcliPath, flags);
    const code = res.status;
    if (res.stdout) {
      getLogger().debug(`qtumd stopped with code ${code}: ${res.stdout}`);
    } else if (res.stderr) {
      getLogger().error(`qtumd stopped with code ${code}: ${res.stderr}`);
      if (res.error) {
        throw Error(res.error.message);
      }
    }

    // Repeatedly check if qtum port is in use
    if (emitEvent) {
      shutdownInterval = setInterval(checkQtumPort, 500);
    }
  }
}

async function unlockWallet(passphrase) {
  // Unlock wallet
  await Wallet.walletPassphrase({ passphrase, timeout: Config.UNLOCK_SECONDS });

  // Ensure wallet is unlocked
  const info = await Wallet.getWalletInfo();
  if (info.unlocked_until > 0) {
    getLogger().info('Wallet unlocked');
    startServices();
  } else {
    const errMessage = 'Wallet unlock failed';
    getLogger().error(errMessage);
    throw Error(errMessage);
  }
}

// Checks if the wallet is encrypted to prompt the wallet unlock dialog
async function checkWalletEncryption() {
  const res = await Wallet.getWalletInfo();
  isEncrypted = !_.isUndefined(res.unlocked_until);

  if (isEncrypted) {
    // For Electron, flag passed via Electron Builder
    if (encryptOk) {
      EmitterHelper.onWalletEncrypted();
      return;
    }

    let flagFound = false;
    _.each(process.argv, (arg) => {
      if (arg === '--encryptok') {
        // For Electron, flag passed via command-line
        EmitterHelper.onWalletEncrypted();
        flagFound = true;
      } else if (arg.startsWith('--passphrase=')) {
        // For dev purposes, unlock wallet directly in server
        const passphrase = (_.split(arg, '=', 2))[1];
        unlockWallet(passphrase);
        flagFound = true;
      }
    });
    if (flagFound) {
      return;
    }

    // No flags found to handle encryption, crash server
    EmitterHelper.onServerStartError(walletEncryptedMessage);
    throw Error(walletEncryptedMessage);
  } else {
    startServices();
  }
}

// Ensure qtumd is running before starting sync/API
async function checkQtumdInit() {
  try {
    // getInfo throws an error if trying to be called before qtumd is running
    await getInstance().getInfo();

    // no error was caught, qtumd is initialized
    clearInterval(checkInterval);
    checkWalletEncryption();
  } catch (err) {
    if (err.message === walletEncryptedMessage) {
      throw Error(err.message);
    } else {
      getLogger().debug(err.message);
    }
  }
}

function startQtumProcess(reindex) {
  try {
    const flags = ['-logevents', '-rpcworkqueue=32', `-rpcuser=${Config.RPC_USER}`, `-rpcpassword=${getRPCPassword()}`];
    if (!isMainnet()) {
      flags.push('-testnet');
    }
    if (reindex) {
      flags.push('-reindex');
    }

    const qtumdPath = `${getQtumPath()}/${execFile.QTUMD}`;
    getLogger().info(`qtumd dir: ${qtumdPath}`);

    qtumProcess = spawn(qtumdPath, flags);
    getLogger().info(`qtumd started on PID ${qtumProcess.pid}`);

    qtumProcess.stdout.on('data', (data) => {
      getLogger().debug(`qtumd output: ${data}`);
    });

    qtumProcess.stderr.on('data', (data) => {
      getLogger().error(`qtumd failed with error: ${data}`);

      if (data.includes('You need to rebuild the database using -reindex-chainstate')) {
        // Clean old process first
        killQtumProcess(false);
        clearInterval(checkInterval);

        // Restart qtumd with reindex flag
        setTimeout(() => {
          getLogger().info('Restarting and reindexing Qtum blockchain');
          startQtumProcess(true);
        }, 3000);
      } else {
        // Emit startup error event to Electron listener
        EmitterHelper.onQtumError(data.toString('utf-8'));

        // add delay to give some time to write to log file
        setTimeout(() => process.exit(), 500);
      }
    });

    qtumProcess.on('close', (code) => {
      getLogger().debug(`qtumd exited with code ${code}`);
    });

    // repeatedly check if qtumd is running
    checkInterval = setInterval(checkQtumdInit, 500);
  } catch (err) {
    throw Error(`qtumd error: ${err.message}`);
  }
}

// Ensure API is running before loading UI
async function checkApiInit() {
  try {
    const res = await fetch(`http://${Config.HOSTNAME}:${Config.PORT}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"query":"{syncInfo{syncBlockNum,syncBlockTime,syncPercent,peerNodeCount}}"}',
    });

    if (res.status >= 200 && res.status < 300) {
      clearInterval(checkApiInterval);
      setTimeout(() => EmitterHelper.onApiInitialized(), 1000);
    }
  } catch (err) {
    getLogger().debug(err.message);
  }
}

function startServices() {
  startSync(true, true);
  initApiServer();

  checkApiInterval = setInterval(checkApiInit, 500);
}

/*
* Sets the env and inits all the required processes.
* @param env {String} blockchainEnv var for mainnet or testnet.
* @param qtumPath {String} Full path to the Qtum execs folder.
* @param encryptionAllowed {Boolean} Are encrypted Qtum wallets allowed.
*/
async function startServer(env, qtumPath, encryptionAllowed) {
  try {
    encryptOk = encryptionAllowed;
    setQtumEnv(env, qtumPath);
    initLogger();
    await initDB();
    startQtumProcess(false);
  } catch (err) {
    EmitterHelper.onServerStartError(err.message);
  }
}

function exit(signal) {
  getLogger().info(`Received ${signal}, exiting...`);

  try {
    killQtumProcess(false);
  } catch (err) {
    // catch error so exit can still call process.exit()
  }

  // add delay to give some time to write to log file
  setTimeout(() => process.exit(), 500);
}

process.on('SIGINT', exit);
process.on('SIGTERM', exit);
process.on('SIGHUP', exit);

module.exports = {
  getQtumProcess,
  killQtumProcess,
  startServices,
  startServer,
  startQtumWallet,
};
