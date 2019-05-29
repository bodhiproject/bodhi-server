const { isNull } = require('lodash');
const DBHelper = require('../db/db-helper');
const logger = require('../utils/logger');

/**
 * Updates the event if the result set is the latest one.
 * @param {object} resultSet Parsed result set event.
 */
module.exports = async (resultSet) => {
  const event = await DBHelper.findOneEvent({ address: resultSet.eventAddress });

  // Log error if event does not exist
  if (isNull(event)) {
    logger.error(`Error updateEvent ${resultSet.eventAddress}: Event does not exist`);
    return;
  }

  if (event.currentRound < resultSet.eventRound + 1) {
    event.currentRound = resultSet.eventRound + 1;
    event.currentResultIndex = resultSet.resultIndex;
    event.consensusThreshold = resultSet.nextConsensusThreshold;
    event.arbitrationEndTime = resultSet.nextArbitrationEndTime;
    await DBHelper.updateEvent(event.txid, event);
  }
};
