const { uniqBy, each } = require('lodash');
const web3 = require('../../web3');
const { TX_STATUS } = require('../../constants');

module.exports = async (
  root,
  {}, // eslint-disable-line no-empty-pattern
  { db: { Events, Bets, ResultSets } },
) => {
  const eventCount = Events.count({});
  let bets = await Bets.find({});
  const resultsets = await ResultSets.find({
    txStatus: TX_STATUS.SUCCESS,
    eventRound: 0,
  });
  bets = bets.concat(resultsets);
  const participantCount = uniqBy(bets, 'betterAddress').length;

  let totalBets = web3.utils.toBN(0);
  each(bets, (bet) => {
    totalBets = totalBets.add(web3.utils.toBN(bet.amount));
  });

  return {
    eventCount,
    participantCount,
    totalBets: totalBets.toString(10),
  };
};
