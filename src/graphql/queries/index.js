const _ = require('lodash');
const { TOKEN } = require('../../constants');
const events = require('./events');
const searchEvents = require('./events');
const bets = require('./bets');
const resultSets = require('./result-sets');
const withdraws = require('./withdraws');
const syncInfo = require('./sync-info');
const mostBets = require('./most-bets');
const biggestWinners = require('./biggest-winners');

module.exports = {
  events,
  searchEvents,
  bets,
  resultSets,
  withdraws,
  syncInfo,
  mostBets,
  biggestWinners,

  leaderboardStats: async (root, { filter, orderBy, limit, skip }, { db: { Votes, Topics } }) => {
    const result = await Votes.find({});
    let participantsCount = 0;
    let totalQtum = new BigNumber(0);
    let totalBot = new BigNumber(0);
    result.reduce((acc, cur) => {
      const curAmount = new BigNumber(cur.amount);
      if (!acc.hasOwnProperty(cur.voterAddress)) {
        acc[cur.voterAddress] = new BigNumber(0);
        participantsCount++;
      }
      if (cur.token === TOKEN.BOT) {
        totalBot = new BigNumber(totalBot).plus(curAmount);
      } else {
        totalQtum = new BigNumber(totalQtum).plus(curAmount);
      }
      return acc;
    }, {});
    return {
      eventCount: Topics.count({}),
      participantsCount,
      totalQtum: totalQtum.toString(10),
      totalBot: totalBot.toString(10),
    };
  },
};
