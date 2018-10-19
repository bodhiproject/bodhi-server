const { getLogger } = require('../../utils/logger');
const { map } = require('lodash');

async function addTypeField(db) {
  try {
    // await db.update({ type: { $exists: false }, token: 'QTUM' }, { $set: { type: 'BET' } }, { multi: true });
    // await db.update({ type: { $exists: false }, token: 'QTUM' }, { $set: { type: 'BET' } }, { multi: true });
    const votes = await db.Votes.find({ type: { $exists: false } });
    map(votes, async (vote) => {
      if (vote.token === 'QTUM') {
        await db.Votes.update({ txid: vote.txid }, { $set: { type: 'BET' } });
      } else if (vote.token === 'BOT') {
        const oracle = await db.Oracles.find({ address: vote.oracleAddress });
        if (oracle[0].token === 'QTUM') await db.Votes.update({ txid: vote.txid }, { $set: { type: 'RESULT_SET' } });
        else if (oracle[0].token === 'BOT') await db.Votes.update({ txid: vote.txid }, { $set: { type: 'VOTE' } });
      }
    });
  } catch (err) {
    getLogger().error(`DB update Error: ${err.message}`);
    throw Error(`DB update Error: ${err.message}`);
  }
}

async function migration2(db) {
  try {
    await addTypeField(db);
  } catch (err) {
    getLogger().error(err.message);
    throw err;
  }
}

module.exports = migration2;
