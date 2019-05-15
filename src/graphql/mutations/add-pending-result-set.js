const { isNull } = require('lodash');
const ResultSet = require('../../models/result-set');
const { logger } = require('../../utils/logger');
const DBHelper = require('../../db/db-helper');
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
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
  } = data;

  const existing = await DBHelper.findOneResultSet(db, { txid });
  if (!isNull(existing)) throw Error('ResultSet already exists');

  const resultSet = new ResultSet({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum,
    eventAddress,
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
  });
  await DBHelper.insertResultSet(db, resultSet);
  logger().debug(`Mutation addPendingResultSet txid:${txid}`);

  return resultSet;
};
