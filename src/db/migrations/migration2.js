const { map } = require('lodash');
const { getLogger } = require('../../utils/logger');

async function migration2(db) {
  try {
    const votes = await db.Votes.find({ type: { $exists: false } });
    map(votes, async (vote) => {
      let type;
      if (vote.token === 'QTUM') {
        type = { type: 'BET' };
      } else if (vote.token === 'BOT') {
        const oracle = await db.Oracles.find({ address: vote.oracleAddress });
        if (oracle[0].token === 'QTUM') type = { type: 'RESULT_SET' };
        else if (oracle[0].token === 'BOT') type = { type: 'VOTE' };
      }
      await db.Votes.update({ txid: vote.txid }, { $set: type });
    });
  } catch (err) {
    getLogger().error(`Migration 2 DB update Error: ${err.message}`);
    throw Error(`Migration 2 DB update Error: ${err.message}`);
  }
}

module.exports = migration2;
