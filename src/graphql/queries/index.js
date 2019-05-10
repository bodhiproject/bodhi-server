const _ = require('lodash');
const { TOKEN } = require('../../constants');
const events = require('./events');
const searchEvents = require('./events');
const bets = require('./bets');
const resultSets = require('./result-sets');
const withdraws = require('./withdraws');
const syncInfo = require('./sync-info');
const mostBets = require('./most-bets');

const getWinnings = async (vote) => {
  const data = await TopicEvent.calculateWinnings({
    contractAddress: vote.topicAddress,
    senderAddress: vote.voterAddress,
  });
  return {
    topicAddress: vote.topicAddress,
    voterAddress: vote.voterAddress,
    amount: {
      bot: data[0],
      qtum: data[1],
    },
  };
};

module.exports = {
  events,
  searchEvents,
  bets,
  resultSets,
  withdraws,
  syncInfo,
  mostBets,


  winners: async (root, { filter, orderBy, limit, skip }, { db: { Votes } }) => {
    const voterFilters = buildVoteFilters(filter);
    const query = filter ? { $or: voterFilters } : {};
    const result = await Votes.find(query); // get all winning votes
    const filtered = [];
    _.each(result, (vote) => {
      if (!_.find(filtered, {
        voterAddress: vote.voterAddress,
        topicAddress: vote.topicAddress,
      })) {
        filtered.push(vote);
      }
    });
    let winnings = [];
    for (const item of filtered) {
      winnings.push(await getWinnings(item));
    }
    winnings = _.orderBy(winnings, [function (o) { return o.amount.qtum; }], ['desc']);
    return winnings;
  },

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
