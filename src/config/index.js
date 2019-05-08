const fs = require('fs');
const { includes, isEmpty, each, split, isNumber } = require('lodash');
const crypto = require('crypto');

const { BLOCKCHAIN_ENV } = require('../constants');
const contractMetadata = require('./contract-metadata');

const API_PORT_MAINNET = 8989;
const API_PORT_TESTNET = 6767;
const API_PORT_REGTEST = 5555;

const EXPLORER_MAINNET = 'https://explorer.qtum.org';
const EXPLORER_TESTNET = 'https://testnet.qtum.org';

const { MAINNET, TESTNET, REGTEST } = BLOCKCHAIN_ENV;

const CONFIG = {
  NETWORK: process.env.NETWORK,
  CONTRACT_VERSION: process.env.CONTRACT_VERSION,
  RPC_MAINNET: 'wss://api.nakachain.org/ws',
  RPC_TESTNET: 'wss://testnet.api.nakachain.org/ws',

  IS_DEV: includes(process.argv, '--dev'),
  PROTOCOL: includes(process.argv, '--local') ? 'http' : 'https',
  HOSTNAME: 'localhost',
  RPC_USER: 'bodhi',
  RPC_PORT_TESTNET: 13889,
  RPC_PORT_MAINNET: 3889,
  DEFAULT_LOG_LEVEL: 'debug',
  CONTRACT_VERSION_NUM: 0,
  TRANSFER_MIN_CONFIRMATIONS: 1,
  DEFAULT_GAS_LIMIT: 250000,
  DEFAULT_GAS_PRICE: 0.0000004,
  CREATE_CORACLE_GAS_LIMIT: 3500000,
  CREATE_DORACLE_GAS_LIMIT: 1500000,
  UNLOCK_SECONDS: 604800,
};
const rpcPassword = getRandomPassword(); // Generate random password for every session

let qtumEnv; // qtumd chain network: mainnet/testnet/regtest
let qtumPath; // path to Qtum executables

function setQtumEnv(env, path) {
  if (isEmpty(env)) {
    throw Error('env cannot be empty.');
  }
  if (isEmpty(path)) {
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
}

/**
 * Returns the environment configuration variables.
 * @return {object} Environment config variables.
 */
function getEnvConfig() {
  if (!qtumEnv || !qtumPath) {
    throw Error('setQtumEnv was not called yet.');
  }

  let apiPort;
  switch (qtumEnv) {
    case MAINNET: {
      apiPort = API_PORT_MAINNET;
      break;
    }
    case TESTNET: {
      apiPort = API_PORT_TESTNET;
      break;
    }
    case REGTEST: {
      apiPort = API_PORT_REGTEST;
      break;
    }
    default: {
      throw Error(`Invalid qtum environment: ${qtumEnv}`);
    }
  }

  return { network: qtumEnv, qtumPath, apiPort };
}

const isMainnet = () => CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET;

function getRPCPassword() {
  let password = rpcPassword;
  each(process.argv, (arg) => {
    if (includes(arg, '--rpcpassword')) {
      password = (split(arg, '=', 2))[1];
    }
  });

  return password;
}

function getQtumRPCAddress() {
  const port = isMainnet() ? CONFIG.RPC_PORT_MAINNET : CONFIG.RPC_PORT_TESTNET;
  return `http://${CONFIG.RPC_USER}:${getRPCPassword()}@${CONFIG.HOSTNAME}:${port}`;
}

function getQtumExplorerUrl() {
  return isMainnet() ? EXPLORER_MAINNET : EXPLORER_TESTNET;
}

function getSSLCredentials() {
  if (!process.env.SSL_KEY_PATH || !process.env.SSL_CERT_PATH) {
    throw Error('SSL Key and Cert paths not found.');
  }

  return {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  };
}

/**
 * Gets the smart contract metadata based on version.
 * @param version {Number} Version number of the contracts to get, e.g. 0, 1, 2.
 * @return {Object} Contract metadata.
 */
const getContractMetadata = (version = CONFIG.CONTRACT_VERSION) => {
  if (!isNumber(version)) throw Error('Must supply a version number');
  return contractMetadata[version];
};

/**
 * Gets the contract address for the given contract name.
 * @param {string} contractName Name of contract to fetch.
 * @return {string} Address of the contract.
 */
const getContractAddress = contractName =>
  contractMetadata[CONFIG.CONTRACT_VERSION][contractName][CONFIG.NETWORK];

/*
* Creates a randomized RPC password.
* Protects against external RPC attacks when the username/password are already known: bodhi/bodhi.
* @return {String} Randomized password.
*/
function getRandomPassword() {
  return crypto.randomBytes(5).toString('hex');
}

module.exports = {
  CONFIG,
  setQtumEnv,
  getEnvConfig,
  isMainnet,
  getRPCPassword,
  getQtumRPCAddress,
  getQtumExplorerUrl,
  getSSLCredentials,
  getContractMetadata,
  getContractAddress,
};
