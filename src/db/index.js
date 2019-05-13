const datastore = require('nedb-promise');
const fs = require('fs-extra');
const path = require('path');
const { getDbDir } = require('../config');
const { logger } = require('../utils/logger');

const MIGRATION_REGEX = /(migration)(\d+)/;
const db = {
  Events: undefined,
  Bets: undefined,
  ResultSets: undefined,
  Withdraws: undefined,
  Blocks: undefined,
  TransactionReceipts: undefined,
};

/**
 * Run all the migrations and initializes all the datastores.
 */
const initDB = async () => {
  const dbDir = getDbDir();
  logger().info(`Data dir: ${dbDir}`);

  db.Events = datastore({ filename: `${dbDir}/events.db` });
  db.Bets = datastore({ filename: `${dbDir}/bets.db` });
  db.ResultSets = datastore({ filename: `${dbDir}/resultsets.db` });
  db.Withdraws = datastore({ filename: `${dbDir}/withdraws.db` });
  db.Blocks = datastore({ filename: `${dbDir}/blocks.db` });
  db.TransactionReceipts = datastore({ filename: `${dbDir}/transactionreceipts.db` });

  try {
    await Promise.all([
      db.Events.loadDatabase(),
      db.Bets.loadDatabase(),
      db.ResultSets.loadDatabase(),
      db.Withdraws.loadDatabase(),
      db.Blocks.loadDatabase(),
      db.TransactionReceipts.loadDatabase(),
    ]);

    await db.Events.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Bets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.ResultSets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Withdraws.ensureIndex({ fieldName: 'txid', unique: true });

    await applyMigrations();
  } catch (err) {
    logger().error(`DB load Error: ${err.message}`);
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
      logger().info('Creating migrations.dat');
      fs.writeFileSync(migrationTrackPath, 'LAST_MIGRATION=0');
    }
  } catch (err) {
    logger().error(`Error creating migrations.dat file: ${err.message}`);
    throw err;
  }

  try {
    // Get last migration number
    lastMigration = Number(await fs.readFileSync(migrationTrackPath)
      .toString().split('=')[1].trim());
  } catch (err) {
    logger().error(`Migration track file loading error: ${err.message}`);
    throw err;
  }

  try {
    // Add migration functions for each migration file
    const migrationPath = path.join(__dirname, 'migrations');

    // Create migrations dir if needed
    if (!fs.existsSync(migrationPath)) {
      logger().info('Creating migrations dir');
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
    logger().error(`Migration scripts load error: ${err.message}`);
    throw err;
  }

  // Run each migration and store the number
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const migration of migrations) {
    try {
      if (Number(migration.number) === lastMigration + 1) {
        // Run migration
        logger().info(`Running migration ${migration.number}...`);
        await migration.migrate(db);

        // Track the last migration number
        lastMigration = migration.number;
        await fs.outputFileSync(migrationTrackPath, `LAST_MIGRATION=${migration.number}\n`);
      }
    } catch (err) {
      logger().error(`Migration ${migration.number} error: ${err.message}`);
      throw err;
    }
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */

  logger().info('Migrations complete.');
}

module.exports = {
  db,
  initDB,
};
