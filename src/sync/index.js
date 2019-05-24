const { isNull } = require('lodash');
const {
  determineContractVersion,
  getContractVersionEndBlock,
  getContractMetadata,
  isMainnet,
} = require('../config');
const { web3 } = require('../web3');
const syncMultipleResultsEventCreated = require('./multiple-results-event-created');
const syncBetPlaced = require('./bet-placed');
const syncResultSet = require('./result-set');
const syncVotePlaced = require('./vote-placed');
const syncVoteResultSet = require('./vote-result-set');
const syncWinningsWithdrawn = require('./winnings-withdrawn');
const DBHelper = require('../db/db-helper');
const { logger } = require('../utils/logger');
const { publishSyncInfo } = require('../graphql/subscriptions');

const SYNC_START_DELAY = 4000;
const BLOCK_BATCHES = 1000;

/**
 * Starts the sync logic. It will loop indefinitely until cancelled.
 * @param shouldUpdateLocalTxs {Boolean} Should it update the local txs or not.
 */
const startSync = async (shouldUpdateLocalTxs) => {
  try {
    // Determine start and end blocks
    const latestBlock = await web3().eth.getBlockNumber();
    const startBlock = await getStartBlock();
    let endBlock = Math.min(startBlock + BLOCK_BATCHES, latestBlock);

    // Get contractMetadata for start and end blocks. If they are different,
    // set the end block to the contract version end block so we don't need to
    // pass different contract metadata versions.
    const startBlockVersion = determineContractVersion(startBlock);
    const endBlockVersion = determineContractVersion(endBlock);
    if (startBlockVersion !== endBlockVersion) {
      const contractEndBlock = getContractVersionEndBlock(startBlockVersion);
      if (contractEndBlock !== -1) endBlock = contractEndBlock;
    }
    const contractMetadata = getContractMetadata(startBlockVersion);

    logger().debug(`Syncing blocks ${startBlock} - ${endBlock}`);

    const syncPromises = [];
    await syncMultipleResultsEventCreated({
      contractMetadata,
      startBlock,
      endBlock,
      syncPromises,
    });
    await syncBetPlaced({ contractMetadata, startBlock, endBlock, syncPromises });
    await syncResultSet({ contractMetadata, startBlock, endBlock, syncPromises });






    const currentBlockNum = await getStartBlock();
    const currentBlockTime = await getBlockTime(currentBlockNum);

    // If block time is null, then we are at latest block.
    if (isNull(currentBlockTime)) {
      delayThenSync(SYNC_START_DELAY, shouldUpdateLocalTxs);
      return;
    }

    logger().debug(`Syncing block ${currentBlockNum}`);

    // Get contract metadata based on block number
    const contractVersion = determineContractVersion(currentBlockNum);
    const contractMetadata = getContractMetadata(contractVersion);

    // Parse blockchain logs
    await syncMultipleResultsEventCreated(contractMetadata, currentBlockNum);
    await syncBetPlaced(contractMetadata, currentBlockNum);
    await syncResultSet(contractMetadata, currentBlockNum);
    await syncVotePlaced(contractMetadata, currentBlockNum);
    await syncVoteResultSet(contractMetadata, currentBlockNum);
    await syncWinningsWithdrawn(contractMetadata, currentBlockNum);

    // Update statuses
    await updateStatusBetting(currentBlockTime);
    await updateStatusOracleResultSetting(currentBlockTime);
    await updateStatusOpenResultSetting(currentBlockTime);
    await updateStatusArbitration(currentBlockTime);
    await updateStatusWithdrawing(currentBlockTime);

    // Insert block
    await insertBlock(currentBlockNum, currentBlockTime);

    // Send syncInfo subscription message
    await publishSyncInfo(currentBlockNum, currentBlockTime);

    // No delay if next block is already confirmed
    delayThenSync(0, shouldUpdateLocalTxs);
  } catch (err) {
    throw err;
  }
};

/**
 * Delays for the specified time then calls startSync.
 * @param {number} delay Number of milliseconds to delay.
 * @param {boolean} shouldUpdateLocalTxs Should updateLocalTxs or not.
 */
const delayThenSync = (delay, shouldUpdateLocalTxs) => {
  logger().debug('sleep');
  setTimeout(() => {
    startSync(shouldUpdateLocalTxs);
  }, delay);
};

/**
 * Determines the start block to start syncing from.
 */
const getStartBlock = async () => {
  let startBlock;
  const blocks = await DBHelper.findLatestBlock();
  if (blocks.length > 0) {
    // Blocks found in DB, use the last synced block as start
    startBlock = blocks[0].blockNum + 1;
  } else {
    // No blocks found in DB, use earliest version's deploy block
    const contractMetadata = getContractMetadata(0);
    startBlock = isMainnet()
      ? contractMetadata.EventFactory.mainnetDeployBlock
      : contractMetadata.EventFactory.testnetDeployBlock;
  }
  return startBlock;
};

/**
 * Gets the block time of the current syncing block.
 * @param blockNum {number} Block number to get the block time of.
 * @return {number|null} Block timestamp of the given block number or null.
 */
const getBlockTime = async (blockNum) => {
  try {
    const block = await web3().eth.getBlock(blockNum);
    if (isNull(block)) return block;
    return Number(block.timestamp);
  } catch (err) {
    throw Error('Error getting block time:', err);
  }
};

/**
 * Updates any events which are in the betting status.
 * @param {number} currentBlockTime Current block timestamp.
 */
const updateStatusBetting = async (currentBlockTime) => {
  try {
    await DBHelper.updateEventStatusBetting(currentBlockTime);
  } catch (err) {
    throw err;
  }
};

/**
 * Updates any events which are in the oracle result setting status.
 * @param {number} currentBlockTime Current block timestamp.
 */
const updateStatusOracleResultSetting = async (currentBlockTime) => {
  try {
    await DBHelper.updateEventStatusOracleResultSetting(currentBlockTime);
  } catch (err) {
    throw err;
  }
};

/**
 * Updates any events which are in the open result setting status.
 * @param {number} currentBlockTime Current block timestamp.
 */
const updateStatusOpenResultSetting = async (currentBlockTime) => {
  try {
    await DBHelper.updateEventStatusOpenResultSetting(currentBlockTime);
  } catch (err) {
    throw err;
  }
};

/**
 * Updates any events which are in the arbitration status.
 */
const updateStatusArbitration = async (currentBlockTime) => {
  try {
    await DBHelper.updateEventStatusArbitration(currentBlockTime);
  } catch (err) {
    throw err;
  }
};

/**
 * Updates any events which are in the withdrawing status.
 */
const updateStatusWithdrawing = async (currentBlockTime) => {
  try {
    await DBHelper.updateEventStatusWithdrawing(currentBlockTime);
  } catch (err) {
    throw err;
  }
};

const insertBlock = async (currentBlockNum, currentBlockTime) => {
  try {
    await DBHelper.insertBlock(currentBlockNum, currentBlockTime);
    logger().debug(`Inserted block ${currentBlockNum}`);
  } catch (err) {
    throw err;
  }
};

module.exports = startSync;
