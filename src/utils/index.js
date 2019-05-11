const fs = require('fs-extra');
const path = require('path');
const { isEmpty } = require('lodash');
const { CONFIG } = require('../config');

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

module.exports = {
  getBaseDataDir,
  getDbDir,
  getLogsDir,
};
