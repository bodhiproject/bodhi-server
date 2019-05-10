const pubsub = require('../../route/pubsub');
const { calculateSyncPercent } = require('../queries/utils');

module.exports = async (syncBlockNum, syncBlockTime) => {
  const syncPercent = await calculateSyncPercent(syncBlockNum);
  pubsub.publish('onSyncInfo', {
    onSyncInfo: {
      syncBlockNum,
      syncBlockTime,
      syncPercent,
    },
  });
};
