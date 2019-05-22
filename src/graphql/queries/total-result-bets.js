const { fill, each, map } = require('lodash');
const DBHelper = require('../../db/db-helper');
const { web3 } = require('../../web3');

const accumulateBets = (numOfResults, bets) => {
  const { toBN } = web3().utils;
  const accumBets = fill(Array(numOfResults), toBN(0));

  each(bets, (bet) => {
    const { resultIndex, amount } = bet;
    accumBets[resultIndex] = accumBets[resultIndex].add(toBN(amount));
  });
  return map(accumBets, r => r.toString(10));
};

module.exports = async (
  root,
  { filter },
  { db },
) => {
  const { eventAddress, betterAddress } = filter;
  if (!eventAddress) throw Error('Must include eventAddress filter');

  // Get num of results for event
  const event = await DBHelper.findOneEvent(db, { address: eventAddress });
  const { numOfResults } = event;

  // Accumulate all result bets
  let bets = await DBHelper.findBet(db, { eventAddress });
  const resultBets = accumulateBets(numOfResults, bets);

  // Accumulate all better bets
  let betterBets;
  if (betterAddress) {
    bets = await DBHelper.findBet(db, { eventAddress, betterAddress });
    betterBets = accumulateBets(numOfResults, bets);
  }

  return {
    resultBets,
    betterBets,
  };
};
