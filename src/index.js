const { initLogger } = require('./utils/logger');
const { initDB } = require('./db');
const startSync = require('./sync');

const start = async () => {
  try {
    initLogger();
    await initDB();
    startSync(true);
  } catch (err) {
    throw err;
  }
};
start();
