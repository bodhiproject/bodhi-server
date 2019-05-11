const fs = require('fs-extra');
const path = require('path');
const { isEmpty, includes, isNumber } = require('lodash');
const { BLOCKCHAIN_ENV } = require('../constants');
const contractMetadata = require('./contract-metadata');

const CONFIG = {
  CONTRACT_VERSION: process.env.CONTRACT_VERSION,
  NETWORK: process.env.NETWORK,
  API_PORT_MAINNET: 8989,
  API_PORT_TESTNET: 6767,
  RPC_MAINNET: 'wss://api.nakachain.org/ws',
  RPC_TESTNET: 'wss://testnet.api.nakachain.org/ws',
  DEFAULT_LOG_LEVEL: 'debug',
  HOSTNAME: 'localhost',
  PROTOCOL: includes(process.argv, '--local') ? 'http' : 'https',
};

/**
 * Returns the base data dir path, and also creates it if necessary.
 * @return {string} Path to the base data directory.
 */
const getBaseDataDir = () => {
  // DATA_DIR is defined in environment variables
  if (!isEmpty(process.env.DATA_DIR)) {
    return process.env.DATA_DIR;
  }

  const rootDir = path.resolve('./');
  const dataDir = `${rootDir}/data/${CONFIG.NETWORK}`;
  fs.ensureDirSync(dataDir);
  return path.resolve(dataDir);
};

/**
 * Returns the database dir path, and also creates it if necesssary.
 * @return {string} Path to the database directory.
 */
const getDbDir = () => {
  const baseDir = getBaseDataDir();
  const dbDir = `${baseDir}/nedb`;
  fs.ensureDirSync(dbDir);
  return path.resolve(dbDir);
};

/**
 * Returns the logs dir path, and also creates it if necesssary.
 * @return {string} Path to the logs directory.
 */
function getLogsDir() {
  const basePath = getBaseDataDir();
  const logsDir = `${basePath}/logs`;
  fs.ensureDirSync(path);
  return path.resolve(logsDir);
}

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
  getDbDir,
  getLogsDir,
  isMainnet,
  getContractMetadata,
  getContractAddress,
  getSSLCredentials,
};
