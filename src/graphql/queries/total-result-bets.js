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
  let totalBetRound = await DBHelper.findBet({ eventAddress, eventRound: 0 });
  const totalBets = accumulateBets(numOfResults, totalBetRound);

  // Accumulate better round 0 bets
  let betterBets
  if (betterAddress) {
    betterBetRound = await DBHelper.findBet({ eventAddress, eventRound: 0, betterAddress });
    betterBets = accumulateBets(numOfResults, betterBetRound);
  }

  // Get result set
  const resultSet = await DBHelper.findResultSet({ eventAddress, eventRound: 0 });
  const { resultIndex, amount: resultSetAmount, centralizedOracleAddress } = resultSet;

  // Accumulate all result bets
  let totalVoteRound = await DBHelper.findBet({ eventAddress, eventRound: { $gt: 0 } } );
  const totalVotes = accumulateBets(numOfResults, totalVoteRound);

  // Add result set amount
  totalVotes[resultIndex] += resultSetAmount

  // Accumulate all better bets
  let betterVotes;
  if (betterAddress) {
    betterVoteRound = await DBHelper.findBet({ eventAddress, betterAddress, eventRound: { $gt: 0 } });
    betterVotes = accumulateBets(numOfResults, betterVoteRound);
    if (betterAddress === centralizedOracleAddress) betterVotes[resultIndex] += resultSetAmount;
  }

  return {
    totalBets,
    betterBets,
    totalVotes,
    betterVotes,
  };
};
