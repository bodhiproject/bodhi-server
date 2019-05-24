require('dotenv').config();
const { initConfig } = require('./config');
const { initDB } = require('./db');
const initApi = require('./route');
const startSync = require('./sync');

/* eslint-disable global-require */
const start = async () => {
  try {
    initConfig();
    require('./utils/logger');
    await initDB();
    require('./web3');
    initApi();
    startSync(true);
  } catch (err) {
    throw err;
  }
};
start();
/* eslint-enable global-require */
