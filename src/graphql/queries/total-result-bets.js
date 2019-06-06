const { isNull, fill, each, map } = require('lodash');
const { lowercaseFilters } = require('./utils');
const DBHelper = require('../../db/db-helper');
const web3 = require('../../web3');

const accumulateBets = (numOfResults, bets) => {
  const { toBN } = web3.utils;
  const accumBets = fill(Array(numOfResults), toBN(0));

  each(bets, (bet) => {
    const { resultIndex, amount } = bet;
    accumBets[resultIndex] = accumBets[resultIndex].add(toBN(amount));
  });
  return map(accumBets, r => r.toString(10));
};

module.exports = async (
  root,
  { filter = {} },
  { db },
) => {
  const { eventAddress, betterAddress } = lowercaseFilters(filter);
  if (!eventAddress) throw Error('Must include eventAddress filter');

  // Get num of results for event
  const event = await DBHelper.findOneEvent({ address: eventAddress });
  if (isNull(event)) throw Error('Event not found');
  const { numOfResults } = event;

  // Accumulate all round 0 bets
  let totalRound0 = await DBHelper.findBet({ eventAddress, eventRound: 0 });
  const totalRound0Bets = accumulateBets(numOfResults, totalRound0);

  // Accumulate better round 0 bets
  let betterRound0Bets
  if (betterAddress) {
    betterRound0 = await DBHelper.findBet({ eventAddress, eventRound: 0, betterAddress });
    betterRound0Bets = accumulateBets(numOfResults, betterRound0);
  }

  // Get result set
  const resultSet = await DBHelper.findResultSet({ eventAddress, eventRound: 0 });
  const { resultIndex, amount: resultSetAmount, centralizedOracleAddress } = resultSet;

  // Accumulate all result bets
  let bets = await DBHelper.findBet({ eventAddress });
  const resultBets = accumulateBets(numOfResults, bets);

  // Add result set amount
  resultBets[resultIndex] += resultSetAmount

  // Accumulate all better bets
  let betterBets;
  if (betterAddress) {
    bets = await DBHelper.findBet({ eventAddress, betterAddress });
    betterBets = accumulateBets(numOfResults, bets);
    if (betterAddress === centralizedOracleAddress) betterBets[resultIndex] += resultSetAmount;
  }

  return {
    resultBets,
    betterBets,
    totalRound0Bets,
    betterRound0Bets,
  };
};
