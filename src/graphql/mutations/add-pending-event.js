const { isNull } = require('lodash');
const { TX_STATUS, EVENT_STATUS } = require('../../constants');
const logger = require('../../utils/logger');
const { getTransaction } = require('../../utils/web3-utils');
const DBHelper = require('../../db/db-helper');
const MultipleResultsEvent = require('../../models/multiple-results-event');

module.exports = async (root, data) => {
  const {
    txid,
    ownerAddress,
    name,
    results,
    numOfResults,
    centralizedOracle,
    betEndTime,
    resultSetStartTime,
    language,
  } = data;

  // Verify not already existing
  const existing = await DBHelper.findOneEvent({ txid });
  if (!isNull(existing)) throw Error('Event already exists');

  // Fetch transaction info and insert
  const txReceipt = await getTransaction(txid);
  await DBHelper.insertTransactionReceipt(txReceipt);

  const multipleResultsEvent = new MultipleResultsEvent({
    txid,
    txStatus: TX_STATUS.PENDING,
    blockNum: txReceipt.blockNum,
    ownerAddress,
    name,
    results,
    numOfResults,
    centralizedOracle,
    betEndTime,
    resultSetStartTime,
    status: EVENT_STATUS.CREATED,
    language,
  });
  await DBHelper.insertEvent(multipleResultsEvent);
  logger.debug(`Mutation addPendingEvent txid:${txid}`);

  return multipleResultsEvent;
};
