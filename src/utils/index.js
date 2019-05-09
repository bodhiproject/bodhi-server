const fs = require('fs-extra');
const path = require('path');
const { isEmpty, map } = require('lodash');

const { CONFIG } = require('../config');
const { getLogger } = require('./logger');

/**
 * Returns the base data dir path, and also creates it if necessary.
 * @return {string} Path to the base data directory.
 */
const getBaseDataDir = () => {
  // DATA_DIR is defined in environment variables
  if (!isEmpty(process.env.DATA_DIR)) {
    return process.env.DATA_DIR;
  }

  const rootDir = path.dirname(require.main.filename);
  const envDir = CONFIG.NETWORK;
  const dataDir = `${rootDir}/data/${envDir}`;
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

/**
 * Checks if the object contains the keys to check for. Throws error if one is not found.
 * @param {object} obj Object to verify keys for.
 * @param {array} keysToCheck Array of strings to check key/values for.
 */
const validateObjKeyValues = (obj, keysToCheck) => {
  keysToCheck.forEach((key) => {
    if (!(key in obj)) {
      throw Error(`${key} should not be undefined.`);
    }
  });
};

/*
* Converts a hex number to decimal string.
* @param input {String|Hex|BN} The hex number to convert.
*/
function hexToDecimalString(input) {
  if (!input) {
    return undefined;
  }

  if (Web3Utils.isBN(input)) {
    return input.toString(10);
  }

  if (Web3Utils.isHex(input)) {
    return Web3Utils.toBN(input).toString(10);
  }

  return input.toString();
}

function hexArrayToDecimalArray(array) {
  if (!array) {
    return undefined;
  }
  return map(array, item => hexToDecimalString(item));
}

/*
* Get correct gas limit determined if voting over consensus threshold or not
*/
async function getVotingGasLimit(oraclesDb, oracleAddress, voteOptionIdx, voteAmount) {
  const oracle = await oraclesDb.findOne({ address: oracleAddress }, { consensusThreshold: 1, amounts: 1 });
  if (!oracle) {
    getLogger().error(`Could not find Oracle ${oracleAddress} in DB.`);
    throw new Error(`Could not find Oracle ${oracleAddress} in DB.`);
  }

  const threshold = Web3Utils.toBN(oracle.consensusThreshold);
  const currentTotal = Web3Utils.toBN(oracle.amounts[voteOptionIdx]);
  const maxVote = threshold.sub(currentTotal);
  return Web3Utils.toBN(voteAmount).gte(maxVote) ? Config.CREATE_DORACLE_GAS_LIMIT : Config.DEFAULT_GAS_LIMIT;
}

module.exports = {
  getBaseDataDir,
  getDbDir,
  getLogsDir,
  validateObjKeyValues,
  hexToDecimalString,
  hexArrayToDecimalArray,
  getVotingGasLimit,
};
