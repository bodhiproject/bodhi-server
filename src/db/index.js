const datastore = require('nedb-promise');
const fs = require('fs-extra');
const path = require('path');

const Utils = require('../utils');
const { getLogger } = require('../utils/logger');

const db = {
  Topics: undefined,
  Oracles: undefined,
  Votes: undefined,
  ResultSets: undefined,
  Withdraws: undefined,
  Blocks: undefined,
  Transactions: undefined,
};

/**
 * Apply necessary migrations.
 * Be sure to wrap each migration script in a try/catch and throw on Error.
 * We don't want the server to run if the migration failed.
 */
async function applyMigrations() {
  const migrationTrackPath = `${__dirname}/migrations.dat`;
  const migrations = [];
  let lastMigrate;

  try {
    if (!fs.existsSync(migrationTrackPath)) {
      getLogger().info('Creating migrations.dat...');
      fs.writeFileSync(migrationTrackPath, 'LAST_MIGRATION=0');
    }
  } catch (err) {
    getLogger().error(`Error creating migrations.dat file: ${err.message}`);
    throw Error(`Error creating migrations.dat file: ${err.message}`);
  }

  try {
    lastMigrate = Number(await fs.readFileSync(migrationTrackPath).toString().split('=')[1].trim());
  } catch (err) {
    getLogger().error(`Migration track file loading Error: ${err.message}`);
    throw Error(`Migration track file loading Error: ${err.message}`);
  }

  try {
    const migrationPath = path.join(__dirname, 'migrations');
    fs.readdirSync(migrationPath).sort().forEach((file) => {
      if (file.endsWith('.js')) {
        const migration = require(`./migrations/${file}`); // eslint-disable-line global-require, import/no-dynamic-require
        migrations.push(migration);
      }
    });
  } catch (err) {
    getLogger().error(`Migration scripts load Error: ${err.message}`);
    throw Error(`Migration scripts load Error ${err.message}`);
  }

  try {
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const migration of migrations) {
      lastMigrate = await migration(db, lastMigrate);
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */
  } catch (err) {
    getLogger().error(`Migration ${lastMigrate + 1} load Error ${err.message}`);
    throw Error(`Migration ${lastMigrate + 1} load Error ${err.message}`);
  }

  try {
    await fs.outputFileSync(migrationTrackPath, `LAST_MIGRATION=${lastMigrate}\n`);
  } catch (err) {
    getLogger().error(`Migration track file update error ${err.message}`);
    throw Error(`Migration track file update error ${err.message}`);
  }
}

/**
 * Run all the migrations and initializes all the datastores.
 */
async function initDB() {
  const blockchainDataPath = Utils.getDataDir();
  getLogger().info(`Blockchain data path: ${blockchainDataPath}`);

  db.Topics = datastore({ filename: `${blockchainDataPath}/topics.db` });
  db.Oracles = datastore({ filename: `${blockchainDataPath}/oracles.db` });
  db.Votes = datastore({ filename: `${blockchainDataPath}/votes.db` });
  db.ResultSets = datastore({ filename: `${blockchainDataPath}/resultsets.db` });
  db.Withdraws = datastore({ filename: `${blockchainDataPath}/withdraws.db` });
  db.Blocks = datastore({ filename: `${blockchainDataPath}/blocks.db` });
  db.Transactions = datastore({ filename: `${blockchainDataPath}/transactions.db` });

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

    await applyMigrations();
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

module.exports = {
  db,
  initDB,
  deleteBodhiData,
};
