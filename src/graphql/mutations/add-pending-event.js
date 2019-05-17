const { isNull } = require('lodash');
const { TX_STATUS, EVENT_STATUS } = require('../../constants');
const { logger } = require('../../utils/logger');
const { getTransaction } = require('../../utils/web3-utils');
const DBHelper = require('../../db/db-helper');
const MultipleResultsEvent = require('../../models/multiple-results-event');

module.exports = async (
  root,
  data,
  { db },
) => {
  const {
    txid,
    ownerAddress,
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

  // Verify not already existing
  const existing = await DBHelper.findOneEvent(db, { txid });
  if (!isNull(existing)) throw Error('Event already exists');

  // Fetch transaction info and insert
  const txReceipt = await getTransaction(txid);
  await DBHelper.insertTransactionReceipt(db, txReceipt);

  const multipleResultsEvent = new MultipleResultsEvent({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum: txReceipt.blockNum,
    ownerAddress,
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
