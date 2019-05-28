const DBHelper = require('../db/db-helper');

/**
 * Updates the event if the result set is the latest one.
 * @param {object} resultSet Parsed result set event.
 */
module.exports = async (resultSet) => {
  const event = await DBHelper.findOneEvent({ address: resultSet.eventAddress });
  if (event.currentRound < resultSet.eventRound + 1) {
    event.currentRound = resultSet.eventRound + 1;
    event.currentResultIndex = resultSet.resultIndex;
    event.consensusThreshold = resultSet.nextConsensusThreshold;
    event.arbitrationEndTime = resultSet.nextArbitrationEndTime;
    await DBHelper.updateEvent(event.txid, event);
  }
};
