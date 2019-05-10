const { isNull } = require('lodash');
const Withdraw = require('../../models/withdraw');
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
    winnerAddress,
    winningAmount,
    escrowAmount,
  } = data;

  const existing = await DBHelper.findOneWithdraw(db, { txid });
  if (!isNull(existing)) throw Error('Withdraw already exists');

  const withdraw = new Withdraw({
    txid,
    blockNum,
    eventAddress,
    winnerAddress,
    winningAmount,
    escrowAmount,
  });
  await DBHelper.insertWithdraw(db, withdraw);
  getLogger().debug(`Mutation addPendingWithdraw txid:${txid}`);

  return withdraw;
};
