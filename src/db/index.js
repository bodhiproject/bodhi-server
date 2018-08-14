const datastore = require('nedb-promise');
const _ = require('lodash');
const fs = require('fs-extra');

const Utils = require('../utils');
const { getLogger } = require('../utils/logger');
const migrateTxDB = require('./migrations/migrateTx');

const db = {
  Topics: undefined,
  Oracles: undefined,
  Votes: undefined,
  ResultSets: undefined,
  Withdraws: undefined,
  Blocks: undefined,
  Transactions: undefined,
};

// Init datastores
async function initDB() {
  try {
    await migrateDB();
  } catch (err) {
    throw new Error(`DB Migration Error: ${err.message}`);
  }

  const blockchainDataPath = Utils.getDataDir();
  getLogger().info(`Blockchain data path: ${blockchainDataPath}`);

  const localCacheDataPath = Utils.getLocalCacheDataDir();
  getLogger().info(`Local cache data path: ${localCacheDataPath}`);

  db.Topics = datastore({ filename: `${blockchainDataPath}/topics.db` });
  db.Oracles = datastore({ filename: `${blockchainDataPath}/oracles.db` });
  db.Votes = datastore({ filename: `${blockchainDataPath}/votes.db` });
  db.ResultSets = datastore({ filename: `${blockchainDataPath}/resultsets.db` });
  db.Withdraws = datastore({ filename: `${blockchainDataPath}/withdraws.db` });
  db.Blocks = datastore({ filename: `${blockchainDataPath}/blocks.db` });
  db.Transactions = datastore({ filename: `${localCacheDataPath}/transactions.db` });

  try {
    await Promise.all([
      db.Topics.loadDatabase(),
      db.Oracles.loadDatabase(),
      db.Votes.loadDatabase(),
      db.ResultSets.loadDatabase(),
      db.Withdraws.loadDatabase(),
      db.Blocks.loadDatabase(),
      db.Transactions.loadDatabase(),
    ]);

    await db.Topics.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Oracles.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Votes.ensureIndex({ fieldName: 'txid', unique: true });
    await db.ResultSets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Withdraws.ensureIndex({ fieldName: 'txid', unique: true });
  } catch (err) {
    throw Error(`DB load Error: ${err.message}`);
  }
}

// Delete blockchain Bodhi data
function deleteBodhiData() {
  const logger = getLogger();
  const blockchainDataPath = Utils.getDataDir();

  try {
    fs.removeSync(`${blockchainDataPath}/topics.db`);
  } catch (err) {
    logger.error(`Delete topics.db error: ${err.message}`);
  }

  try {
    fs.removeSync(`${blockchainDataPath}/oracles.db`);
  } catch (err) {
    logger.error(`Delete oracles.db error: ${err.message}`);
  }

  try {
    fs.removeSync(`${blockchainDataPath}/votes.db`);
  } catch (err) {
    logger.error(`Delete votes.db error: ${err.message}`);
  }

  try {
    fs.removeSync(`${blockchainDataPath}/resultsets.db`);
  } catch (err) {
    logger.error(`Delete resultsets.db error: ${err.message}`);
  }

  try {
    fs.removeSync(`${blockchainDataPath}/withdraws.db`);
  } catch (err) {
    logger.error(`Delete withdraws.db error: ${err.message}`);
  }

  try {
    fs.removeSync(`${blockchainDataPath}/blocks.db`);
  } catch (err) {
    logger.error(`Delete blocks.db error: ${err.message}`);
  }

  logger.info('Bodhi data deleted.');
}

// Migrate DB
async function migrateDB() {
  // check migration script in migration folder
  await migrateTxDB();
}

module.exports = {
  db,
  initDB,
  deleteBodhiData,
};
