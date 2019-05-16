const { isNull } = require('lodash');
const { TX_STATUS, EVENT_STATUS } = require('../../constants');
const { logger } = require('../../utils/logger');
const DBHelper = require('../../db/db-helper');
const MultipleResultsEvent = require('../../models/multiple-results-event');

module.exports = async (
  root,
  data,
  { db },
) => {
  const {
    txid,
    blockNum,
    ownerAddress,
    version,
    name,
    results,
    numOfResults,
    centralizedOracle,
    betStartTime,
    betEndTime,
    resultSetStartTime,
    resultSetEndTime,
    language,
  } = data;

  const existing = await DBHelper.findOneEvent(db, { txid });
  if (!isNull(existing)) throw Error('Event already exists');

  const multipleResultsEvent = new MultipleResultsEvent({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum,
    ownerAddress,
    version,
    name,
    results,
    numOfResults,
    centralizedOracle,
    betStartTime,
    betEndTime,
    resultSetStartTime,
    resultSetEndTime,
    status: EVENT_STATUS.CREATED,
    language,
  });
  await DBHelper.insertEvent(db, multipleResultsEvent);
  logger().debug(`Mutation addPendingEvent txid:${txid}`);

  return multipleResultsEvent;
};
