const { isNull } = require('lodash');
const web3 = require('../web3');
const logger = require('../utils/logger');
const DBHelper = require('../db/db-helper');

/**
 * Gets the block time of the current syncing block.
 * @param blockNum {number} Block number to get the block time of.
 * @return {number|null} Block timestamp of the given block number or null.
 */
const getBlockTime = async (blockNum) => {
  const block = await web3.eth.getBlock(blockNum);
  if (isNull(block)) throw Error(`Could not get block ${blockNum}`);
  return Number(block.timestamp);
};

module.exports = ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    const addPromise = (blockNum) => {
      syncPromises.push(limit(async (bNum) => {
        try {
          // Get block time and insert
          const blockTime = await getBlockTime(bNum);
          await DBHelper.insertBlock(bNum, blockTime);
        } catch (insertErr) {
          logger.error('Error insert Block');
          throw insertErr;
        }
      }, blockNum));
    };
    for (let i = startBlock; i <= endBlock; i++) addPromise(i);
  } catch (err) {
    logger.error('Error insertBlocks');
    throw err;
  }
};
