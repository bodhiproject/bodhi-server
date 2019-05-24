require('dotenv').config();
const { initConfig } = require('./config');
const { initLogger } = require('./utils/logger');
const { initDB } = require('./db');
const initApi = require('./route');
const startSync = require('./sync');

const start = async () => {
  try {
    initConfig();
    initLogger();
    await initDB();
    require('./web3'); // eslint-disable-line global-require
    initApi();
    startSync(true);
  } catch (err) {
    throw err;
  }
};
start();
