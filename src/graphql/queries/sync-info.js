const { logger } = require('../../utils/logger');
const { calculateSyncPercent } = require('./utils');

module.exports = async (root, {}, { db: { Blocks } }) => { // eslint-disable-line no-empty-pattern
  let blocks;
  try {
    blocks = await Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
  } catch (err) {
    logger().error(`Error querying latest block: ${err.message}`);
  }

  const syncBlockNum = (blocks && blocks[0].blockNum) || 0;
  const syncBlockTime = (blocks && blocks[0].blockTime) || 0;
  const syncPercent = await calculateSyncPercent(syncBlockNum);

  return {
    syncBlockNum,
    syncBlockTime,
    syncPercent,
  };
};
