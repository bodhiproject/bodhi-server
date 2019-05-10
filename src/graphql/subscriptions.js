const pubsub = require('../route/pubsub');
const { calculateSyncPercent } = require('./queries/utils');

/**
 * Send the syncInfo subscription message.
 * @param {number} syncBlockNum Current block number synced.
 * @param {string} syncBlockTime Current block time synced.
 */
const publishSyncInfo = async (syncBlockNum, syncBlockTime) => {
  const syncPercent = await calculateSyncPercent(syncBlockNum);
  pubsub.publish('onSyncInfo', {
    onSyncInfo: {
      syncBlockNum,
      syncBlockTime,
      syncPercent,
    },
  });
};

module.exports = { publishSyncInfo };
