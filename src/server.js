const _ = require('lodash');
const path = require('path');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const { spawn } = require('child_process');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const EventEmitter = require('events');
const fetch = require('node-fetch');
const portscanner = require('portscanner');

const {
  Config, setQtumEnv, isMainnet, getRPCPassword,
} = require('./config/config');
const { initDB } = require('./db/nedb');
const { initLogger, getLogger } = require('./utils/logger');
const Emitter = require('./utils/emitterHelper');
const Utils = require('./utils/utils');
const schema = require('./schema');
const syncRouter = require('./route/sync');
const apiRouter = require('./route/api');
const { startSync } = require('./sync');
const { ipcEvent, execFile } = require('./constants');
const { getInstance } = require('./qclient');
const Wallet = require('./api/wallet');

let qtumProcess;
let server;
let isEncrypted = false;
let checkInterval;
let checkApiInterval;
let shutdownInterval;

function getQtumProcess() {
  return qtumProcess;
}

// Checks to see if the qtumd port is still in use
function checkQtumPort() {
  const port = isMainnet() ? Config.RPC_PORT_MAINNET : Config.RPC_PORT_TESTNET;
  portscanner.checkPortStatus(port, Config.HOSTNAME, (error, status) => {
    if (status === 'closed') {
      clearInterval(shutdownInterval);

      // Slight delay before sending qtumd killed signal
      setTimeout(() => Emitter.onQtumKilled(), 1500);
    } else {
      getLogger().debug('Waiting for qtumd to shut down.');
    }
  });
}

/*
* Kills the running qtum process.
* @param emitEvent {Boolean} Flag to emit an event when qtum is fully shutdown.
*/
function killQtumProcess(emitEvent) {
  if (qtumProcess) {
    qtumProcess.kill();

    // Repeatedly check if qtum port is in use
    if (emitEvent) {
      shutdownInterval = setInterval(checkQtumPort, 500);
    }
  }
}

// Checks if the wallet is encrypted to prompt the wallet unlock dialog
async function checkWalletEncryption() {
  const res = await Wallet.getWalletInfo();
  isEncrypted = !_.isUndefined(res.unlocked_until);

  if (isEncrypted) {
    if (_.includes(process.argv, '--encryptok')) {
      Emitter.onWalletEncrypted();
    } else {
      throw Error('Your wallet is encrypted. Please use a non-encrypted wallet for the server.');
    }
  } else {
    startServices();
  }
}

// Ensure qtumd is running before starting sync/API
async function checkQtumdInit() {
  try {
    // getInfo throws an error if trying to be called before qtumd is running
    const info = await getInstance().getInfo();

    // no error was caught, qtumd is initialized
    clearInterval(checkInterval);
    checkWalletEncryption();
  } catch (err) {
    getLogger().debug(err.message);
  }
}

function startQtumProcess(reindex) {
  const flags = ['-logevents', '-rpcworkqueue=32', `-rpcuser=${Config.RPC_USER}`, `-rpcpassword=${getRPCPassword()}`];
  if (!isMainnet()) {
    flags.push('-testnet');
  }
  if (reindex) {
    flags.push('-reindex');
  }

  const qtumdPath = Utils.getQtumPath(execFile.QTUMD);
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
        console.log('Restarting and reindexing Qtum blockchain');
        startQtumProcess(true);
      }, 3000);
    } else {
      // Emit startup error event to Electron listener
      Emitter.onQtumError(data.toString('utf-8'));

      // add delay to give some time to write to log file
      setTimeout(() => {
        process.exit();
      }, 500);
    }
  });

  qtumProcess.on('close', (code) => {
    getLogger().debug(`qtumd exited with code ${code}`);
  });

  // repeatedly check if qtumd is running
  checkInterval = setInterval(checkQtumdInit, 500);
}

// Create Restify server and apply routes
async function startAPI() {
  server = restify.createServer({ title: 'Bodhi API' });
  const cors = corsMiddleware({ origins: ['*'] });
  server.pre(cors.preflight);
  server.use(cors.actual);
  server.use(restify.plugins.bodyParser({ mapParams: true }));
  server.use(restify.plugins.queryParser());
  server.on('after', (req, res, route, err) => {
    if (route) {
      getLogger().debug(`${route.methods[0]} ${route.spec.path} ${res.statusCode}`);
    } else {
      getLogger().error(`${err.message}`);
    }
  });

  syncRouter.applyRoutes(server);
  apiRouter.applyRoutes(server);

  server.get(/\/?.*/, restify.plugins.serveStatic({
    directory: path.join(__dirname, '../ui'),
    default: 'index.html',
    maxAge: 0,
  }));

  server.listen(Config.PORT, () => {
    SubscriptionServer.create(
      { execute, subscribe, schema },
      { server, path: '/subscriptions' },
    );
    getLogger().info(`Bodhi API is running at http://${Config.HOSTNAME}:${Config.PORT}.`);
  });
}

// Ensure API is running before loading UI
async function checkApiInit() {
  try {
    const res = await fetch(`http://${Config.HOSTNAME}:${Config.PORT}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"query":"{syncInfo{syncBlockNum,syncBlockTime,syncPercent}}"}',
    });

    if (res.status >= 200 && res.status < 300) {
      clearInterval(checkApiInterval);
      setTimeout(() => Emitter.onApiInitialized(), 1000);
    }
  } catch (err) {
    getLogger().debug(err.message);
  }
}

function startServices() {
  startSync();
  startAPI();

  checkApiInterval = setInterval(checkApiInit, 500);
}

// Start all services
async function startServer(env) {
  setQtumEnv(env);
  initLogger();
  await initDB();
  startQtumProcess(false);
}

function exit(signal) {
  getLogger().info(`Received ${signal}, exiting`);

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
  server,
};
