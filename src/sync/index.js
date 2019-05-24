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
const syncBlocks = require('./blocks');
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
    await syncVotePlaced({ contractMetadata, startBlock, endBlock, syncPromises });
    await syncVoteResultSet({ contractMetadata, startBlock, endBlock, syncPromises });
    await syncWinningsWithdrawn({ contractMetadata, startBlock, endBlock, syncPromises });
    syncBlocks({ startBlock, endBlock, syncPromises });
    await Promise.all(syncPromises);

    // Update statuses
    const { blockTime } = await DBHelper.findOneBlock({ blockNum: endBlock });
    await DBHelper.updateEventStatusBetting(blockTime);
    await DBHelper.updateEventStatusOracleResultSetting(blockTime);
    await DBHelper.updateEventStatusOpenResultSetting(blockTime);
    await DBHelper.updateEventStatusArbitration(blockTime);
    await DBHelper.updateEventStatusWithdrawing(blockTime);

    // Send syncInfo subscription message
    await publishSyncInfo(endBlock, blockTime);



    // const currentBlockNum = await getStartBlock();
    // const currentBlockTime = await getBlockTime(currentBlockNum);

    // If block time is null, then we are at latest block.
    if (isNull(currentBlockTime)) {
      delayThenSync(SYNC_START_DELAY, shouldUpdateLocalTxs);
      return;
    }

    // logger().debug(`Syncing block ${currentBlockNum}`);

    // Get contract metadata based on block number
    // const contractVersion = determineContractVersion(currentBlockNum);
    // const contractMetadata = getContractMetadata(contractVersion);

    // Parse blockchain logs
    // await syncMultipleResultsEventCreated(contractMetadata, currentBlockNum);
    // await syncBetPlaced(contractMetadata, currentBlockNum);
    // await syncResultSet(contractMetadata, currentBlockNum);
    // await syncVotePlaced(contractMetadata, currentBlockNum);
    // await syncVoteResultSet(contractMetadata, currentBlockNum);
    // await syncWinningsWithdrawn(contractMetadata, currentBlockNum);

    // Update statuses
    // await updateStatusBetting(currentBlockTime);
    // await updateStatusOracleResultSetting(currentBlockTime);
    // await updateStatusOpenResultSetting(currentBlockTime);
    // await updateStatusArbitration(currentBlockTime);
    // await updateStatusWithdrawing(currentBlockTime);

    // Insert block
    // await insertBlock(currentBlockNum, currentBlockTime);

    // Send syncInfo subscription message
    // await publishSyncInfo(currentBlockNum, currentBlockTime);

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

module.exports = startSync;
