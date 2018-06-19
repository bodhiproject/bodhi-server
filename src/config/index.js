const _ = require('lodash');
const crypto = require('crypto');

const { blockchainEnv } = require('../constants');
const mainnetMetadata = require('./mainnet/contract_metadata');
const testnetMetadata = require('./testnet/contract_metadata');

const EXPLORER_TESTNET = 'https://testnet.qtum.org';
const EXPLORER_MAINNET = 'https://explorer.qtum.org';

const Config = {
  HOSTNAME: '127.0.0.1',
  PORT: 8989,
  RPC_USER: 'bodhi',
  RPC_PORT_TESTNET: 13889,
  RPC_PORT_MAINNET: 3889,
  DEFAULT_LOGLVL: 'debug',
  CONTRACT_VERSION_NUM: 0,
  TRANSFER_MIN_CONFIRMATIONS: 1,
  DEFAULT_GAS_LIMIT: 250000,
  DEFAULT_GAS_PRICE: 0.0000004,
  CREATE_CORACLE_GAS_LIMIT: 3500000,
  CREATE_DORACLE_GAS_LIMIT: 1500000,
  UNLOCK_SECONDS: 86400,
};
const rpcPassword = getRandomPassword(); // Generate random password for every session

let qtumEnv; // Qtumd environment var: testnet/mainnet
let qtumPath; // Path to Qtum executables

function setQtumEnv(env, path) {
  if (_.isEmpty(env)) {
    throw Error('env cannot be empty.');
  }
  if (_.isEmpty(path)) {
    throw Error('path cannot be empty.');
  }
  if (qtumEnv) {
    throw Error('qtumEnv was already set.');
  }
  if (qtumPath) {
    throw Error('qtumPath was already set.');
  }

  qtumEnv = env;
  qtumPath = path;
  console.log(`Environment: ${qtumEnv}`);
  console.log(`Qtum Path: ${qtumPath}`);
}

function getQtumEnv() {
  return qtumEnv;
}

function getQtumPath() {
  return qtumPath;
}

function isMainnet() {
  // Throw an error to ensure no code is using this check before it is initialized
  if (!qtumEnv) {
    throw Error('qtumEnv not initialized yet before checking env');
  }

  return qtumEnv === blockchainEnv.MAINNET;
}

function getRPCPassword() {
  let password = rpcPassword;
  _.each(process.argv, (arg) => {
    if (_.includes(arg, '-rpcpassword')) {
      password = (_.split(arg, '=', 2))[1];
    }
  });

  return password;
}

function getQtumRPCAddress() {
  const port = isMainnet() ? Config.RPC_PORT_MAINNET : Config.RPC_PORT_TESTNET;
  return `http://${Config.RPC_USER}:${getRPCPassword()}@localhost:${port}`;
}

function getQtumExplorerUrl() {
  return isMainnet() ? EXPLORER_MAINNET : EXPLORER_TESTNET;
}

/*
* Gets the smart contract metadata based on version and environment.
* @param versionNum {Number} The version number of the contracts to get, ie. 0, 1, 2.
* @param testnet {Boolean} Whether on testnet env or not.
* @return {Object} The contract metadata.
*/
function getContractMetadata(versionNum = Config.CONTRACT_VERSION_NUM) {
  if (!_.isNumber(versionNum)) {
    throw new Error('Must supply a version number');
  }

  if (isMainnet()) {
    return mainnetMetadata[versionNum];
  }
  return testnetMetadata[versionNum];
}

/*
* Creates a randomized RPC password.
* Protects against external RPC attacks when the username/password are already known: bodhi/bodhi.
* @return {String} Randomized password.
*/
function getRandomPassword() {
  return crypto.randomBytes(5).toString('hex');
}

module.exports = {
  Config,
  setQtumEnv,
  getQtumEnv,
  getQtumPath,
  isMainnet,
  getRPCPassword,
  getQtumRPCAddress,
  getQtumExplorerUrl,
  getContractMetadata,
};
