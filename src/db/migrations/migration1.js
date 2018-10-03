const _ = require('lodash');
const fs = require('fs-extra');
const { getLogger } = require('../../utils/logger');
const Utils = require('../../utils');

async function addLanguageField(db) {
  try {
    await db.update({ language: { $exists: false } }, { $set: { language: 'en-US' } }, { multi: true });
  } catch (err) {
    throw Error(`DB update Error: ${err.message}`);
  }
}


async function migration1(db) {
  const migrationTrackPath = `${__dirname}/../migrations.dat`;
  try {
    let lastMigrate = Number(await fs.readFileSync(migrationTrackPath).toString().split('=')[1].trim());
    if (lastMigrate < 1) {
      await addLanguageField(db.Oracles);
      await addLanguageField(db.Topics);
      lastMigrate++;
      getLogger.info(`Success migration${lastMigrate}`);
    }
    await fs.outputFileSync(migrationTrackPath, `LAST_MIGRATION=${lastMigrate}\n`);
  } catch (err) {
    throw Error(`DB track file Error: ${err.message}`);
  }
}

module.exports = migration1;
