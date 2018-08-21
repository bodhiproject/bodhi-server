const fs = require('fs-extra');
const _ = require('lodash');
const Web3Utils = require('web3-utils');

const { Config, isMainnet } = require('../config');
const { version } = require('../../package.json');
const { getLogger } = require('./logger');

/*
* Checks for dev flag
*/
function isDevEnv() {
  return _.includes(process.argv, '--dev');
}

/**
 * Returns the base data dir path, and also creates the directory if it doesn't exist. This will vary based on OS.
 */
function getBaseDataDir() {
  let osBasePath;
  switch (process.platform) {
    case 'darwin': {
      osBasePath = `${process.env.HOME}/Library/Application Support/Bodhi`;
      break;
    }
    case 'win32': {
      osBasePath = `${process.env.APPDATA}/Bodhi`;
      break;
    }
    case 'linux': {
      osBasePath = `${process.env.HOME}/.bodhi`;
      break;
    }
    default: {
      throw Error(`Operating system not supported: ${process.platform}`);
    }
  }
  const envDir = isMainnet() ? 'mainnet' : 'testnet';
  const dataDir = isDevEnv() ? 'dev' : 'data';
  return `${osBasePath}/${envDir}/${dataDir}`;
}

/*
* Returns the path where the local cache data (Transaction table) directory is,
* and also creates the directory if it doesn't exist.
* The Local cache should exist regardless of version change, for now
*/
function getLocalCacheDataDir() {
  const dataDir = `${getBaseDataDir()}/local/nedb`;

  // Create data dir if needed
  fs.ensureDirSync(dataDir);

  return dataDir;
}

// Returns the path where the blockchain version directory is.
function getVersionDir() {
  const basePath = getBaseDataDir();
  const regex = RegExp(/(\d+)\.(\d+)\.(\d+)-(c\d+)-(d\d+)/g);
  const regexGroups = regex.exec(version);
  if (regexGroups === null) {
    throw new Error(`Invalid version number: ${version}`);
  }

  // Example: 0.6.5-c0-d1
  // c0 = contract version 0, d1 = db version 1
  const versionDir = `${basePath}/${regexGroups[4]}_${regexGroups[5]}`; // c0_d1

  // Create data dir if needed
  fs.ensureDirSync(versionDir);

  return versionDir;
}

/**
 * Returns the full path to the database directory, and creates the directory if it doesn't exist.
 */
function getDataDir() {
  const basePath = getBaseDataDir();
  const path = `${basePath}/nedb`;
  fs.ensureDirSync(path); // Create dir if needed
  return path;
}

/*
* Returns the path where the blockchain log directory is, and also creates the directory if it doesn't exist.
*/
function getLogDir() {
  const versionDir = getVersionDir();
  const logDir = `${versionDir}/logs`;

  // Create data dir if needed
  fs.ensureDirSync(logDir);

  return logDir;
}

/**
 * Gets the path for the Qtum binaries. Can either:
 * 1. Set QTUM_PATH in .env file. eg. QTUM_PATH=./qtum/mac/bin
 * 2. Pass the path in the --qtumpath flag via commandline. eg. --qtumpath=./qtum/mac/bin
 * The QTUM_PATH in .env will take priority over the qtumpath cli flag.
 * @return {string} The path to the Qtum bin folder.
 */
function getDevQtumExecPath() {
  // Must pass in the absolute path to the bin/ folder
  let qtumPath;

  if (process.env.QTUM_PATH) {
    // QTUMPATH found in .env
    qtumPath = process.env.QTUM_PATH;
  } else {
    // Search for --qtumpath flag in command-line args
    _.each(process.argv, (arg) => {
      if (_.includes(arg, '--qtumpath')) {
        qtumPath = (_.split(arg, '=', 2))[1];
      }
    });
  }

  if (!qtumPath) {
    throw Error('Qtum path was not found.');
  }
  return qtumPath;
}

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
  return _.map(array, item => hexToDecimalString(item));
}

async function isAllowanceEnough(owner, spender, amount) {
  try {
    const res = await require('../api/bodhi-token').allowance({ // eslint-disable-line global-require
      owner,
      spender,
      senderAddress: owner,
    });

    const allowance = Web3Utils.toBN(res.remaining);
    const amountBN = Web3Utils.toBN(amount);
    return allowance.gte(amountBN);
  } catch (err) {
    getLogger().error(`Error checking allowance: ${err.message}`);
    throw err;
  }
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
  isDevEnv,
  getBaseDataDir,
  getLocalCacheDataDir,
  getVersionDir,
  getDataDir,
  getLogDir,
  getDevQtumExecPath,
  hexToDecimalString,
  hexArrayToDecimalArray,
  isAllowanceEnough,
  getVotingGasLimit,
};
