const datastore = require('nedb-promise');
const fs = require('fs-extra');
const path = require('path');

const { getDbDir } = require('../utils');
const { getLogger } = require('../utils/logger');

const db = {
  Events: undefined,
  Bets: undefined,
  ResultSets: undefined,
  Withdraws: undefined,
  Blocks: undefined,
  Transactions: undefined,
};
const MIGRATION_REGEX = /(migration)(\d+)/;

/**
 * Run all the migrations and initializes all the datastores.
 */
const initDB = async () => {
  const dbDir = getDbDir();
  getLogger().info(`Data dir: ${dbDir}`);

  db.Events = datastore({ filename: `${dbDir}/events.db` });
  db.Bets = datastore({ filename: `${dbDir}/oracles.db` });
  db.ResultSets = datastore({ filename: `${dbDir}/resultsets.db` });
  db.Withdraws = datastore({ filename: `${dbDir}/withdraws.db` });
  db.Blocks = datastore({ filename: `${dbDir}/blocks.db` });
  db.Transactions = datastore({ filename: `${dbDir}/transactions.db` });

  try {
    await Promise.all([
      db.Events.loadDatabase(),
      db.Bets.loadDatabase(),
      db.ResultSets.loadDatabase(),
      db.Withdraws.loadDatabase(),
      db.Blocks.loadDatabase(),
      db.Transactions.loadDatabase(),
    ]);

    await db.Events.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Bets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.ResultSets.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Withdraws.ensureIndex({ fieldName: 'txid', unique: true });

    await applyMigrations();
  } catch (err) {
    getLogger().error(`DB load Error: ${err.message}`);
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
      getLogger().info('Creating migrations.dat');
      fs.writeFileSync(migrationTrackPath, 'LAST_MIGRATION=0');
    }
  } catch (err) {
    getLogger().error(`Error creating migrations.dat file: ${err.message}`);
    throw err;
  }

  try {
    // Get last migration number
    lastMigration = Number(await fs.readFileSync(migrationTrackPath)
      .toString().split('=')[1].trim());
  } catch (err) {
    getLogger().error(`Migration track file loading error: ${err.message}`);
    throw err;
  }

  try {
    // Add migration functions for each migration file
    const migrationPath = path.join(__dirname, 'migrations');
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
    getLogger().error(`Migration scripts load error: ${err.message}`);
    throw err;
  }

  // Run each migration and store the number
  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const migration of migrations) {
    try {
      if (Number(migration.number) === lastMigration + 1) {
        // Run migration
        getLogger().info(`Running migration ${migration.number}...`);
        await migration.migrate(db);

        // Track the last migration number
        lastMigration = migration.number;
        await fs.outputFileSync(migrationTrackPath, `LAST_MIGRATION=${migration.number}\n`);
      }
    } catch (err) {
      getLogger().error(`Migration ${migration.number} error: ${err.message}`);
      throw err;
    }
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */

  getLogger().info('Migrations complete.');
}

module.exports = {
  db,
  initDB,
};
