const { getLogger } = require('../../utils/logger');

async function addLanguageField(db) {
  try {
    await db.update({ language: { $exists: false } }, { $set: { language: 'zh-Hans-CN' } }, { multi: true });
  } catch (err) {
    getLogger().error(`DB update Error: ${err.message}`);
    throw Error(`DB update Error: ${err.message}`);
  }
}

async function migration1(db) {
  try {
    await addLanguageField(db.Oracles);
    await addLanguageField(db.Topics);
  } catch (err) {
    getLogger().error(err.message);
    throw err;
  }
}

module.exports = migration1;
