const fs = require('fs-extra');
const path = require('path');
const { map, sortBy, filter, each, isUndefined, isEmpty, isNumber } = require('lodash');
const { BLOCKCHAIN_ENV } = require('../constants');
const ConfigManager = require('./contracts/config-manager');
const EventFactory = require('./contracts/event-factory');
const MultipleResultsEvent = require('./contracts/multiple-results-event');

const CONFIG = {
  NETWORK: process.env.NETWORK,
  WS_PROVIDER_MAINNET: 'wss://api.nakachain.org/ws',
  WS_PROVIDER_TESTNET: 'wss://testnet.api.nakachain.org/ws',
  PROTOCOL: process.env.SSL === 'true' ? 'https' : 'http',
  HOSTNAME: 'localhost',
  API_PORT_MAINNET: 8888,
  API_PORT_TESTNET: 9999,
  DEFAULT_LOG_LEVEL: 'debug',
  STARTING_CONTRACT_VERSION_MAINNET: 5,
  STARTING_CONTRACT_VERSION_TESTNET: 0,
};

let versionConfig;

/**
 * Initializes the config needed for the server.
 */
const initConfig = () => {
  // Get all version numbers and sort
  let keys = Object.keys(EventFactory);
  keys = sortBy(map(keys, key => Number(key)));

  // Filter out keys less than starting version
  const startVersion = process.env.NETWORK === BLOCKCHAIN_ENV.MAINNET
    ? CONFIG.STARTING_CONTRACT_VERSION_MAINNET
    : CONFIG.STARTING_CONTRACT_VERSION_TESTNET;
  keys = filter(keys, key => key >= startVersion);
  if (keys.length === 0) throw Error('No EventFactory versions found');

  // Create new array
  versionConfig = [];
  const blockKey = process.env.NETWORK === BLOCKCHAIN_ENV.MAINNET
    ? 'mainnetDeployBlock' : 'testnetDeployBlock';

  // Calculate start and end blocks for each version
  const maxVersion = keys[keys.length - 1];
  each(keys, (key) => {
    const startBlock = EventFactory[`${key}`][blockKey];
    const endBlock = key + 1 < maxVersion
      ? EventFactory[`${key + 1}`][blockKey] - 1
      : -1;
    versionConfig.push({
      version: key,
      startBlock,
      endBlock,
    });
  });

  if (!versionConfig) throw Error('Could not initialize versionConfig');
};

/**
 * Returns the base data dir path, and also creates it if necessary.
 * @return {string} Path to the base data directory.
 */
const getBaseDataDir = () => {
  let dataDir;

  // TEST_ENV=true set in environment
  if (process.env.TEST_ENV === 'true') {
    dataDir = path.resolve('./data/test');
    fs.ensureDirSync(dataDir);
    return dataDir;
  }

  // DATA_DIR is defined in environment
  if (!isEmpty(process.env.DATA_DIR)) {
    dataDir = path.resolve(process.env.DATA_DIR);
    fs.ensureDirSync(dataDir);
    return dataDir;
  }

  // Ensure network is defined
  const network = CONFIG.NETWORK;
  if (isEmpty(network)) throw Error('NETWORK not defined in environment');

  dataDir = path.resolve(`./data/${network}`);
  fs.ensureDirSync(dataDir);
  return dataDir;
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

/**
 * Determines the correct contract version for a block number.
 * @param {number} blockNum Block number to determine which contract version to use.
 * @return {number} Contract version.
 */
const determineContractVersion = (blockNum) => {
  if (isUndefined(blockNum)) throw Error('blockNum is undefined');
  if (!versionConfig) throw Error('versionConfig was not initialized');

  let contractVersion = -1;
  each(versionConfig, (cfg) => {
    // If block is in current version range, set version and break loop
    if ((blockNum >= cfg.startBlock && blockNum <= cfg.endBlock)
      || (blockNum >= cfg.startBlock && cfg.endBlock === -1)) {
      contractVersion = cfg.version;
      return false;
    }
    return true;
  });
  if (contractVersion === -1) {
    throw Error('Could not determine contract version');
  }

  return contractVersion;
};

/**
 * Gets the end block of a given contract version.
 * @param {number} version Contract version number
 * @return {number} End block of the contract version
 */
const getContractVersionEndBlock = version => versionConfig[version].endBlock;

/**
 * Gets the ConfigManager smart contract metadata based on version.
 * @param version {Number} Version number of the contracts to get, e.g. 0, 1, 2.
 * @return {Object} Contract metadata.
 */
const configManagerMeta = (version) => {
  if (!isNumber(version)) throw Error('Must supply a version number');
  return ConfigManager[version];
};

/**
 * Gets the EventFactory smart contract metadata based on version.
 * @param version {Number} Version number of the contracts to get, e.g. 0, 1, 2.
 * @return {Object} Contract metadata.
 */
const eventFactoryMeta = (version) => {
  if (!isNumber(version)) throw Error('Must supply a version number');
  return EventFactory[version];
};

/**
 * Gets the MultipleResultsEvent smart contract metadata based on version.
 * @param version {Number} Version number of the contracts to get, e.g. 0, 1, 2.
 * @return {Object} Contract metadata.
 */
const multipleResultsEventMeta = (version) => {
  if (!isNumber(version)) throw Error('Must supply a version number');
  return MultipleResultsEvent[version];
};

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
  getBaseDataDir,
  getDbDir,
  getLogsDir,
  isMainnet,
  determineContractVersion,
  getContractVersionEndBlock,
  configManagerMeta,
  eventFactoryMeta,
  multipleResultsEventMeta,
  getSSLCredentials,
};
