const { initLogger } = require('./utils/logger');
const { initWeb3 } = require('./web3');
const { initDB } = require('./db');
const initApi = require('./route');
const startSync = require('./sync');

const start = async () => {
  try {
    initLogger();
    await initDB();
    initWeb3();
    initApi();
    startSync(true);
  } catch (err) {
    throw err;
  }
};
start();
