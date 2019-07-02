const datastore = require('nedb-promise');
const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const { getDbDir } = require('../config');
const logger = require('../utils/logger');

const MIGRATION_REGEX = /(migration)(\d+)/;
const db = {
  Events: undefined,
  Bets: undefined,
  ResultSets: undefined,
  Withdraws: undefined,
  Blocks: undefined,
  TransactionReceipts: undefined,
  GlobalLeaderboard: undefined,
  EventLeaderboard: undefined,
};

/**
 * Run all the migrations and initializes all the datastores.
 */
const initDB = async () => {
  const dbDir = getDbDir();
  logger.info(`Data dir: ${dbDir}`);

  db.Events = datastore({ filename: `${dbDir}/events.db` });
  db.Bets = datastore({ filename: `${dbDir}/bets.db` });
  db.ResultSets = datastore({ filename: `${dbDir}/resultsets.db` });
  db.Withdraws = datastore({ filename: `${dbDir}/withdraws.db` });
  db.Blocks = datastore({ filename: `${dbDir}/blocks.db` });
  db.TransactionReceipts = datastore({ filename: `${dbDir}/transactionreceipts.db` });
  db.GlobalLeaderboard = datastore({ filename: `${dbDir}/globalleaderboard.db` });
  db.EventLeaderboard = datastore({ filename: `${dbDir}/eventleaderboard.db` });

  try {
    await Promise.all([
      db.Events.loadDatabase(),
      db.Bets.loadDatabase(),
      db.ResultSets.loadDatabase(),
      db.Withdraws.loadDatabase(),
      db.Blocks.loadDatabase(),
      db.TransactionReceipts.loadDatabase(),
      db.GlobalLeaderboard.loadDatabase(),
      db.EventLeaderboard.loadDatabase(),
    ]);

    await db.Blocks.ensureIndex({ fieldName: 'blockNum', unique: true });
    await db.Events.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Bets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.ResultSets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Withdraws.ensureIndex({ fieldName: 'txid', unique: true });
    await db.TransactionReceipts.ensureIndex({ fieldName: 'transactionHash' });
    await db.GlobalLeaderboard.ensureIndex({ fieldName: 'userAddress', unique: true });
    await db.EventLeaderboard.ensureIndex({ fieldName: 'eventAddress' });

    if (process.env.TEST_ENV !== 'true') {
      await applyMigrations();
    }
  } catch (err) {
    logger.error(`DB load Error: ${err.message}`);
    throw err;
  }
};

/**
 * Apply necessary migrations.
 * Be sure to wrap each migration script in a try/catch and throw on Error.
 * We don't want the server to run if the migration failed.
 */
async function applyMigrations() {
  const dbDir = getDbDir();
  const migrationTrackPath = `${dbDir}/migrations.dat`;
  const migrations = [];
  let lastMigration;

  try {
    // Create migrations.dat file if not found
    if (!fs.existsSync(migrationTrackPath)) {
      logger.info('Creating migrations.dat');
      fs.writeFileSync(migrationTrackPath, 'LAST_MIGRATION=0');
    }
  } catch (err) {
    logger.error(`Error creating migrations.dat file: ${err.message}`);
    throw err;
  }

  try {
    // Get last migration number
    lastMigration = Number(await fs.readFileSync(migrationTrackPath)
      .toString().split('=')[1].trim());
  } catch (err) {
    logger.error(`Migration track file loading error: ${err.message}`);
    throw err;
  }

  try {
    // Add migration functions for each migration file
    const migrationPath = path.join(__dirname, 'migrations');

    // Create migrations dir if needed
    if (!fs.existsSync(migrationPath)) {
      logger.info('Creating migrations dir');
      fs.ensureDirSync(migrationPath);
    }

    fs.readdirSync(migrationPath).sort().forEach((file) => {
      if (file.endsWith('.js')) {
        // Get migration script number
        const regexMatches = MIGRATION_REGEX.exec(file);
        if (!regexMatches.length >= 2) {
          throw Error(`Invalid migration script name: ${file}`);
        }

        // Get migration function
        const migrate = require(`./migrations/${file}`); // eslint-disable-line global-require, import/no-dynamic-require

        migrations.push({
          number: Number(regexMatches[2]),
          migrate,
        });
      }
    });
  } catch (err) {
    logger.error(`Migration scripts load error: ${err.message}`);
    throw err;
  }
  /**
   * whilst source code: https://caolan.github.io/async/v3/whilst.js.html
   * check(err, truth) and next(err, res) are built-in funcs in the source code
   * whilst(test, iter, callback):
   *    1. test: take check(err, truth), if truth is true, then call iter(next), otherwise, call callback to end the loop
   *    2. iter: take next(err, res), which triggers test if no err, otherwise trigger callback(err)
   *    3. callback: will only be triggered if test fails, or err encountered, reaching callback means end of the loop
  */
  try {
    let i = 0;
    await async.whilst(
      check => check(null, i < migrations.length), // trigger iter
      (next) => {
        const migration = migrations[i];
        i++;
        try {
          if (Number(migration.number) > lastMigration) {
            // Run migration
            logger.info(`Running migration ${migration.number}...`);
            // pass next() to migrate(), await not allowed, only callback func
            migration.migrate(() => {
              // Track the last migration number
              lastMigration = migration.number;
              fs.outputFileSync(migrationTrackPath, `LAST_MIGRATION=${lastMigration}\n`);
              next(null, i); // trigger the next test
            });
          } else {
            next(null, i); // if no migration here, trigger the next test
          }
        } catch (err) {
          next(err, i); // err met, trigger the callback to end this loop
        }
      },
    );
  } catch (err) {
    // will only be called if should end this loop
    logger.error(err);
    throw err;
  }
  logger.info('Migrations complete.');
}

module.exports = {
  db,
  initDB,
};
