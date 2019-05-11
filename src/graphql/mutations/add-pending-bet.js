const { isNull } = require('lodash');
const Bet = require('../../models/bet');
const { logger } = require('../../utils/logger');
const { DBHelper } = require('../../db/db-helper');
const { TX_STATUS } = require('../../constants');

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
    txStatus: TX_STATUS.PENDING,
    blockNum,
    eventAddress,
    betterAddress,
    resultIndex,
    amount,
    eventRound,
  });
  await DBHelper.insertBet(db, bet);
  logger().debug(`Mutation addPendingBet txid:${txid}`);

  return bet;
};
