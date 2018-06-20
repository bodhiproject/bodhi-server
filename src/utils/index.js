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

/*
* Returns the path where the data directory is, and also creates the directory if it doesn't exist.
*/
function getBaseDataDir() {
  let osDataDir;
  switch (process.platform) {
    case 'darwin': {
      osDataDir = `${process.env.HOME}/Library/Application Support`;
      break;
    }
    case 'win32': {
      osDataDir = process.env.APPDATA;
      break;
    }
    case 'linux': {
      osDataDir = `${process.env.HOME}/.config`;
      break;
    }
    default: {
      throw Error(`Operating system not supported: ${process.platform}`);
    }
  }
  osDataDir += '/Bodhi';

  const pathPrefix = isMainnet() ? 'mainnet' : 'testnet';
  let basePath = `${osDataDir}/${pathPrefix}`;
  if (isDevEnv()) {
    basePath += '/dev';
  }
  return basePath;
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

/*
* Returns the path where the blockchain data directory is, and also creates the directory if it doesn't exist.
*/
function getDataDir() {
  const versionDir = getVersionDir();

  // production
  const dataDir = `${versionDir}/nedb`;

  // Create data dir if needed
  fs.ensureDirSync(dataDir);

  return dataDir;
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

/*
* Gets the path for the Qtum binaries. Must pass the path in a flag via commandline.
* return {String} The full path for the Qtum binaries folder.
*/
function getDevQtumExecPath() {
  // Must pass in the absolute path to the bin/ folder
  let qtumPath;
  _.each(process.argv, (arg) => {
    if (_.includes(arg, '-qtumpath')) {
      qtumPath = (_.split(arg, '=', 2))[1];
    }
  });

  if (!qtumPath) {
    throw Error('Must pass in the --qtumpath flag with the path to qtum bin folder.');
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
    const res = await require('../api/bodhi_token').allowance({
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
