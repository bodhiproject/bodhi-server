const datastore = require('nedb-promise');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');
const migration2 = require('../migration2');

Chai.use(ChaiAsPromised);
const assert = Chai.assert;
const expect = Chai.expect;

async function initDB(db) {
  db.Oracles = datastore({ filename: './mock/oracles' });
  db.Votes = datastore({ filename: './mock/votes' });

  try {
    await Promise.all([
      db.Oracles.loadDatabase(),
      db.Votes.loadDatabase(),
    ]);

    await db.Oracles.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Votes.ensureIndex({ fieldName: 'txid', unique: true });
  } catch (err) {
    throw Error(`Migration test DB load Error: ${err.message}`);
  }
}

describe('Type Field Migration', () => {
  describe('1 central & 1 decentral oracle + votes for each type', () => {
    const db = {
      Oracles: undefined,
      Votes: undefined,
    };
    if (fs.existsSync(path.join(__dirname, './mock/votes'))) fs.unlinkSync(path.join(__dirname, './mock/votes'));
    fsExtra.copySync(path.join(__dirname, './mock/votes.copy'), path.join(__dirname, './mock/votes'));
    it('Run migration', async () => {
      await initDB(db);
      await migration2(db);
    });
  });
});
