const datastore = require('nedb-promise');
const fs = require('fs');
const { fill, map } = require('lodash');
const fsExtra = require('fs-extra');
const path = require('path');
const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');
const migration2 = require('../migration2');
const DBHelper = require('../../../db/db-helper');

Chai.use(ChaiAsPromised);
const expect = Chai.expect;

async function insertOracles(db) {
  const cOracle = {
    blockNum: 162282,
    txid: '6228b0ae15147dac52130c17e4fae196b36f4cde86fce3070357e724d8649f6a',
    version: 0,
    address: '21255aa2ece777d8d7b9572fe018761aa3a6dde1',
    topicAddress: '64a2cc9a78f2faff6a7401e393f3a90731704ab6',
    resultSetterAddress: 'qWG4tBKgscVxkRGwRZdBt2Whkb66VD5g9h',
    startTime: 1529540100,
    endTime: 1530389700,
    resultSetStartTime: 1530389700,
    resultSetEndTime: 1530403200,
    consensusThreshold: '10000000000',
    name: 'Winner of the Bay Area Best Ramen Bar Grand Prix',
    options: ['Invalid', 'Miso-ya', 'Ramen Do-jo', 'Ippudo SF', 'Shalala Ramen'],
    optionIdxs: [0, 1, 2, 3, 4],
    amounts: ['0', '812000000', '0', '19990000000', '100000'],
    resultIdx: 3,
    status: 'WITHDRAW',
    token: 'QTUM',
    hashId: null,
    language: 'zh-Hans-CN',
  };

  const dOracle = {
    blockNum: 223343,
    txid: 'f306b48d2197402dd801bf8a0c768f52bb5cd27b12da773bbadca680864aad64',
    version: 0,
    address: '596b41260670dc5d0187d0b6f92773794509c8bc',
    topicAddress: '64a2cc9a78f2faff6a7401e393f3a90731704ab6',
    amounts: fill(Array(5), '0'),
    optionIdxs: [0, 1, 2, 4],
    endTime: 1538387296,
    consensusThreshold: '11000000000',
    name: 'Winner of the Bay Area Best Ramen Bar Grand Prix',
    options: ['Invalid', 'Miso-ya', 'Ramen Do-jo', 'Ippudo SF', 'Shalala Ramen'],
    resultIdx: null,
    startTime: 1538383696,
    status: 'WITHDRAW',
    token: 'BOT',
    language: 'zh-Hans-CN',
  };
  await DBHelper.insertOracle(db.Oracles, cOracle);
  await DBHelper.insertOracle(db.Oracles, dOracle);
}

async function insertVotes(db) {
  const resultset = {
    blockNum: 223343,
    txid: 'f306b48d2197402dd801bf8a0c768f52bb5cd27b12da773bbadca680864aad64',
    version: 0,
    oracleAddress: '21255aa2ece777d8d7b9572fe018761aa3a6dde1',
    voterAddress: 'qJHp6dUSmDShpEEMmwxqHPo7sFSdydSkPM',
    optionIdx: 3,
    amount: '10000000000',
    token: 'BOT',
    topicAddress: '64a2cc9a78f2faff6a7401e393f3a90731704ab6',
  };
  const vote = {
    blockNum: 223345,
    txid: '35d7745be0da899675ec376cc50f051a25642afc38fd3f718541f3e05638deca',
    version: 0,
    oracleAddress: '596b41260670dc5d0187d0b6f92773794509c8bc',
    voterAddress: 'qJHp6dUSmDShpEEMmwxqHPo7sFSdydSkPM',
    optionIdx: 3,
    amount: '10000000000',
    token: 'BOT',
    topicAddress: '64a2cc9a78f2faff6a7401e393f3a90731704ab6',
  };
  const bet = {
    blockNum: 166342,
    txid: 'e7cef57e9202819ebbc7db919f42aaec038cbbd378c608bacb5f02d318d4021f',
    version: 0,
    oracleAddress: '596b41260670dc5d0187d0b6f92773794509c8bc',
    voterAddress: 'qMmN4PNBmHvCcUAfQBHkGZsYrGkovzo8W2',
    optionIdx: 4,
    amount: '100000',
    token: 'QTUM',
    topicAddress: '64a2cc9a78f2faff6a7401e393f3a90731704ab6',
  };
  await db.Votes.insert(resultset);
  await db.Votes.insert(vote);
  await db.Votes.insert(bet);
}

async function initDB(db) {
  fsExtra.ensureFileSync(path.join(__dirname, './mock/votes.test.db'));
  fsExtra.ensureFileSync(path.join(__dirname, './mock/oracles.test.db'));
  db.Oracles = datastore({ filename: path.join(__dirname, './mock/oracles.test.db') });
  db.Votes = datastore({ filename: path.join(__dirname, './mock/votes.test.db') });

  try {
    await Promise.all([
      db.Oracles.loadDatabase(),
      db.Votes.loadDatabase(),
    ]);

    await db.Oracles.ensureIndex({ fieldName: 'txid', unique: true });
    await db.Votes.ensureIndex({ fieldName: 'txid', unique: true });
    await insertOracles(db);
    await insertVotes(db);
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

    it('completes the migration', async () => {
      await initDB(db);
      await migration2(db);

      const votes = await db.Votes.find({ blockNum: { $exists: true } });
      expect(votes.length).to.equal(3);
      map(votes, async (vote) => {
        if (vote.token === 'QTUM') {
          expect(vote.type).to.equal('BET');
        } else if (vote.token === 'BOT') {
          const oracle = await db.Oracles.find({ address: vote.oracleAddress });
          if (oracle[0].token === 'QTUM') expect(vote.type).to.equal('RESULT_SET');
          else if (oracle[0].token === 'BOT') expect(vote.type).to.equal('VOTE');
        }
      });
    });
    if (fs.existsSync(path.join(__dirname, './mock/votes.test.db'))) fs.unlinkSync(path.join(__dirname, './mock/votes.test.db'));
    if (fs.existsSync(path.join(__dirname, './mock/oracles.test.db'))) fs.unlinkSync(path.join(__dirname, './mock/oracles.test.db'));
  });
});
