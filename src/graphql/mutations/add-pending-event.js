const { isNull } = require('lodash');
const { EVENT_STATUS } = require('../../constants');
const { getLogger } = require('../../utils/logger');
const { DBHelper } = require('../../db/db-helper');
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

  const existingEvent = await DBHelper.findOneEvent(db, { txid });
  if (!isNull(existingEvent)) throw Error('Event already exists');

  const multipleResultsEvent = new MultipleResultsEvent({
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
    status: EVENT_STATUS.CREATED,
    language,
  });
  await DBHelper.insertEvent(db, multipleResultsEvent);
  getLogger().debug(`Mutation addPendingEvent txid:${txid}`);

  return multipleResultsEvent;
};
