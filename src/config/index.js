const fs = require('fs-extra');
const path = require('path');
const { map, sortBy, each, isUndefined, isEmpty, isNumber } = require('lodash');
const { BLOCKCHAIN_ENV } = require('../constants');
const contractMetadata = require('./contract-metadata');

const CONFIG = {
  CONTRACT_VERSION: Number(process.env.CONTRACT_VERSION),
  NETWORK: process.env.NETWORK,
  RPC_MAINNET: 'https://api.nakachain.org',
  RPC_TESTNET: 'https://testnet.api.nakachain.org',
  PROTOCOL: process.env.SSL === 'true' ? 'https' : 'http',
  HOSTNAME: 'localhost',
  API_PORT_MAINNET: 8888,
  API_PORT_TESTNET: 9999,
  DEFAULT_LOG_LEVEL: 'debug',
};

let versionConfig;

/**
 * Initializes the config needed for the server.
 */
const initConfig = () => {
  // Get all version numbers and sort
  let keys = Object.keys(contractMetadata);
  keys = sortBy(map(keys, key => Number(key)));

  // Create new array
  versionConfig = Array(keys.length);
  const blockKey = process.env.NETWORK === BLOCKCHAIN_ENV.MAINNET
    ? 'mainnetDeployBlock' : 'testnetDeployBlock';

  // Calculate start and end blocks for each version
  each(keys, (key, index) => {
    const startBlock = contractMetadata[`${key}`].EventFactory[blockKey];
    const endBlock = index + 1 < keys.length
      ? contractMetadata[`${key + 1}`].EventFactory[blockKey] - 1
      : -1;
    versionConfig[index] = {
      version: index,
      startBlock,
      endBlock,
    };
  });
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

  const network = CONFIG.NETWORK;
  if (isEmpty(network)) throw Error('NETWORK not defined in environment');

  const rootDir = path.resolve('./');
  const dataDir = `${rootDir}/data/${network}`;
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
  fs.ensureDirSync(logsDir);
  return path.resolve(logsDir);
}

const isMainnet = () => CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET;

const determineContractVersion = (blockNum) => {
  if (isUndefined(blockNum)) throw Error('blockNum is undefined');
  if (!versionConfig) throw Error('versionConfig was not initialized');
  if (blockNum < versionConfig[0].startBlock) throw Error('blockNum out of range');

  let contractVersion;
  each(versionConfig, (cfg) => {
    // If endBlock is -1, we are in latest version so break loop
    if (cfg.endBlock === -1) {
      contractVersion = cfg.version;
      return false;
    }

    // If block is in current version range, set version and break loop
    if (blockNum >= cfg.startBlock && blockNum <= cfg.endBlock) {
      contractVersion = cfg.version;
      return false;
    }

    return true;
  });
  if (isUndefined(contractVersion)) {
    throw Error('Could not determine contract version');
  }

  return contractVersion;
};

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
    throw Error('SSL Key and Cert paths not found');
  }

  return {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  };
};

module.exports = {
  CONFIG,
  initConfig,
  getDbDir,
  getLogsDir,
  isMainnet,
  getContractMetadata,
  getContractAddress,
  getSSLCredentials,
};
