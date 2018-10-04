const _ = require('lodash');
const fs = require('fs-extra');
const { getLogger } = require('../../utils/logger');
const Utils = require('../../utils');

async function addLanguageField(db) {
  try {
    await db.update({ language: { $exists: true } }, { $set: { language: 'Chinese' } }, { multi: true });
  } catch (err) {
    throw Error(`DB update Error: ${err.message}`);
  }
}


async function migration1(db, lastMigrate) {
  try {
    if (lastMigrate < 2) {
      await addLanguageField(db.Oracles);
      await addLanguageField(db.Topics);
      lastMigrate++;
      getLogger().info(`Success migration${lastMigrate}`);
    }
    return lastMigrate;
  } catch (err) {
    getLogger().error(`DB update Error: ${err.message}`);
    throw Error(`DB track file Error: ${err.message}`);
  }
}


module.exports = migration1;
