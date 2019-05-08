const fs = require('fs');
const { includes, isNumber } = require('lodash');

const { BLOCKCHAIN_ENV } = require('../constants');
const contractMetadata = require('./contract-metadata');

const CONFIG = {
  CONTRACT_VERSION: process.env.CONTRACT_VERSION,
  NETWORK: process.env.NETWORK,
  API_PORT_MAINNET: 8989,
  API_PORT_TESTNET: 6767,
  RPC_MAINNET: 'wss://api.nakachain.org/ws',
  RPC_TESTNET: 'wss://testnet.api.nakachain.org/ws',

  IS_DEV: includes(process.argv, '--dev'),
  PROTOCOL: includes(process.argv, '--local') ? 'http' : 'https',
  HOSTNAME: 'localhost',
  DEFAULT_LOG_LEVEL: 'debug',
  TRANSFER_MIN_CONFIRMATIONS: 1,
  DEFAULT_GAS_LIMIT: 250000,
  DEFAULT_GAS_PRICE: 0.0000004,
  CREATE_CORACLE_GAS_LIMIT: 3500000,
  CREATE_DORACLE_GAS_LIMIT: 1500000,
};

const isMainnet = () => CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET;

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

const getSSLCredentials = () => {
  if (!process.env.SSL_KEY_PATH || !process.env.SSL_CERT_PATH) {
    throw Error('SSL Key and Cert paths not found.');
  }

  return {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  };
};

module.exports = {
  CONFIG,
  isMainnet,
  getContractMetadata,
  getContractAddress,
  getSSLCredentials,
};
