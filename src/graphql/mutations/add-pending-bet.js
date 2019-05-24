const { isNull } = require('lodash');
const Bet = require('../../models/bet');
const { logger } = require('../../utils/logger');
const { getTransaction } = require('../../utils/web3-utils');
const DBHelper = require('../../db/db-helper');
const { TX_STATUS } = require('../../constants');

module.exports = async (
  root,
  data,
  { db },
) => {
  const {
    txid,
    eventAddress,
    betterAddress,
    resultIndex,
    amount,
    eventRound,
  } = data;

  // Verify not already existing
  const existing = await DBHelper.findOneBet({ txid });
  if (!isNull(existing)) throw Error('Bet already exists');

  // Fetch transaction info and insert
  const txReceipt = await getTransaction(txid);
  await DBHelper.insertTransactionReceipt(txReceipt);

  const bet = new Bet({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum: txReceipt.blockNum,
    eventAddress,
    betterAddress,
    resultIndex,
    amount,
    eventRound,
  });
  await DBHelper.insertBet(bet);
  logger().debug(`Mutation addPendingBet txid:${txid}`);

  return bet;
};
