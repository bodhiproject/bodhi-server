const { isNull } = require('lodash');
const ResultSet = require('../../models/result-set');
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
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
    fromVote,
  } = data;

  // Verify not already existing
  const existing = await DBHelper.findOneResultSet(db, { txid });
  if (!isNull(existing)) throw Error('ResultSet already exists');

  // Fetch transaction info and insert
  const txReceipt = await getTransaction(txid);
  await DBHelper.insertTransactionReceipt(db, txReceipt);

  const resultSet = new ResultSet({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum: txReceipt.blockNum,
    eventAddress,
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
    fromVote,
  });
  await DBHelper.insertResultSet(db, resultSet);
  logger().debug(`Mutation addPendingResultSet txid:${txid}`);

  console.log(resultSet);
  return resultSet;
};
