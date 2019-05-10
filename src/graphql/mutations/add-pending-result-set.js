const { isNull } = require('lodash');
const ResultSet = require('../../models/result-set');
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
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
  } = data;

  const existingEvent = await DBHelper.findOneResultSet(db, { txid });
  if (!isNull(existingEvent)) throw Error('ResultSet already exists');

  const resultSet = new ResultSet({
    txid,
    blockNum,
    eventAddress,
    centralizedOracleAddress,
    resultIndex,
    amount,
    eventRound,
  });
  await DBHelper.insertResultSet(db, resultSet);
  getLogger().debug(`Mutation addPendingResultSet txid:${txid}`);

  return resultSet;
};
