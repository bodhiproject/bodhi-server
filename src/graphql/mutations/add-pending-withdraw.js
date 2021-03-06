const { isNull } = require('lodash');
const Withdraw = require('../../models/withdraw');
const logger = require('../../utils/logger');
const { getTransaction } = require('../../utils/web3-utils');
const DBHelper = require('../../db/db-helper');
const { TX_STATUS } = require('../../constants');

module.exports = async (root, data) => {
  const {
    txid,
    eventAddress,
    winnerAddress,
    winningAmount,
    escrowAmount,
  } = data;

  // Verify not already existing
  const existing = await DBHelper.findOneWithdraw({ txid });
  if (!isNull(existing)) throw Error('Withdraw already exists');

  // Fetch transaction info and insert
  const txReceipt = await getTransaction(txid);
  await DBHelper.insertTransactionReceipt(txReceipt);

  const withdraw = new Withdraw({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum: txReceipt.blockNum,
    eventAddress,
    winnerAddress,
    winningAmount,
    escrowWithdrawAmount: escrowAmount,
  });
  await DBHelper.insertWithdraw(withdraw);
  logger.debug(`Mutation addPendingWithdraw txid:${txid}`);

  return withdraw;
};
