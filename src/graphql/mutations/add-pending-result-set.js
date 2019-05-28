const { isNull } = require('lodash');
const ResultSet = require('../../models/result-set');
const logger = require('../../utils/logger');
const { getTransaction } = require('../../utils/web3-utils');
const DBHelper = require('../../db/db-helper');
const { TX_STATUS } = require('../../constants');

module.exports = async (root, data) => {
  const {
    txid,
    eventAddress,
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
  } = data;

  // Verify not already existing
  const existing = await DBHelper.findOneResultSet({ txid });
  if (!isNull(existing)) throw Error('ResultSet already exists');

  // Fetch transaction info and insert
  const txReceipt = await getTransaction(txid);
  await DBHelper.insertTransactionReceipt(txReceipt);

  const resultSet = new ResultSet({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum: txReceipt.blockNum,
    eventAddress,
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
  });
  await DBHelper.insertResultSet(resultSet);
  logger.debug(`Mutation addPendingResultSet txid:${txid}`);

  return resultSet;
};
