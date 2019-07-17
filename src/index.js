require('dotenv').config();
const { initConfig } = require('./config');
const { initDB } = require('./db');
const initApi = require('./route');
const { initSync, startSync } = require('./sync');

// Handle unhandled promise rejections in entire app
process.on('unhandledRejection', (reason) => {
  throw reason;
});

/* eslint-disable global-require */
(async () => {
  try {
    initConfig();
    require('./utils/logger');
    require('./utils/client-logger');
    require('./event');
    await initDB();
    initSync();
    require('./web3');
    initApi();
    await startSync(true);
  } catch (err) {
    throw err;
  }
})();
/* eslint-enable global-require */
