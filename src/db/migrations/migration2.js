const { getLogger } = require('../../utils/logger');

async function migration2(db, lastMigratation) {
  try {
    let migration = lastMigratation;
    if (migration === 0) {
      migration++;
      getLogger().info(`Success migration${migration}`);
    }
    return migration;
  } catch (err) {
    getLogger().error(`Migration 1 error: ${err.message}`);
    throw Error(`Migration 1 error: ${err.message}`);
  }
}

module.exports = migration2;
