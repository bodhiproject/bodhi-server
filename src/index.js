const { initLogger } = require('./utils/logger');
const { initDB } = require('./db');
const startSync = require('./sync');

const start = async () => {
  initLogger();
  await initDB();
  startSync(true);
};
start();
