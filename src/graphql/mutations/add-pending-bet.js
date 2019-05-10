const { isNull } = require('lodash');
const Bet = require('../../models/bet');
const { getLogger } = require('../../utils/logger');
const { DBHelper } = require('../../db/db-helper');

module.exports = async (
  root,
  data,
  { db },
) => {
  const {
    txid,
    blockNum,
    eventAddress,
    betterAddress,
    resultIndex,
    amount,
    eventRound,
  } = data;

  const existing = await DBHelper.findOneBet(db, { txid });
  if (!isNull(existing)) throw Error('Bet already exists');

  const bet = new Bet({
    txid,
    blockNum,
    eventAddress,
    betterAddress,
    resultIndex,
    amount,
    eventRound,
  });
  await DBHelper.insertBet(db, bet);
  getLogger().debug(`Mutation addPendingBet txid:${txid}`);

  return bet;
};
