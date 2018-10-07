const { getLogger } = require('../../utils/logger');

async function addLanguageField(db) {
  try {
    await db.update({ language: { $exists: false } }, { $set: { language: 'zh-Hans-CN' } }, { multi: true });
  } catch (err) {
    getLogger().error(`DB update Error: ${err.message}`);
    throw Error(`DB update Error: ${err.message}`);
  }
}

async function migration1(db, lastMigrate) {
  try {
    let migration = lastMigrate;
    if (migration === 0) {
      await addLanguageField(db.Oracles);
      await addLanguageField(db.Topics);
      migration++;
      getLogger().info(`Success migration${migration}`);
    }
    return migration;
  } catch (err) {
    getLogger().error(`Migration 1 error: ${err.message}`);
    throw Error(`Migration 1 error: ${err.message}`);
  }
}

module.exports = migration1;
