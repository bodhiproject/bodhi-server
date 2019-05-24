const { uniqBy, each } = require('lodash');
const web3 = require('../../web3');

module.exports = async (
  root,
  {}, // eslint-disable-line no-empty-pattern
  { db: { Events, Bets } },
) => {
  const eventCount = Events.count({});
  const bets = await Bets.find({});
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
