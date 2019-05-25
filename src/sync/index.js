const pLimit = require('p-limit');
const { getContractMetadata, isMainnet } = require('../config');
const web3 = require('../web3');
const {
  syncMultipleResultsEventCreated,
  pendingMultipleResultsEventCreated,
} = require('./multiple-results-event-created');
const { syncBetPlaced, pendingBetPlaced } = require('./bet-placed');
const { syncResultSet, pendingResultSet } = require('./result-set');
const { syncVotePlaced, pendingVotePlaced } = require('./vote-placed');
const { syncVoteResultSet, pendingVoteResultSet } = require('./vote-result-set');
const { syncWinningsWithdrawn, pendingWinningsWithdrawn } = require('./winnings-withdrawn');
const syncBlocks = require('./blocks');
const DBHelper = require('../db/db-helper');
const logger = require('../utils/logger');
const { publishSyncInfo } = require('../graphql/subscriptions');

const SYNC_START_DELAY = 3000;
const BLOCK_BATCH_COUNT = 500;
const PROMISE_CONCURRENCY_LIMIT = 40;

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
 * Delays for the specified time then calls startSync.
 * @param {number} delay Number of milliseconds to delay.
 */
const delayThenSync = (delay) => {
  logger.debug('sleep');
  setTimeout(() => {
    startSync();
  }, delay);
};

/**
 * Starts the sync logic. It will loop indefinitely until cancelled.
 */
const startSync = async () => {
  try {
    // Determine start and end blocks
    const latestBlock = await web3.eth.getBlockNumber();
    const startBlock = await getStartBlock();
    const endBlock = Math.min(startBlock + BLOCK_BATCH_COUNT, latestBlock);

    logger.info(`Syncing blocks ${startBlock} - ${endBlock}`);
    const syncPromises = [];
    const limit = pLimit(PROMISE_CONCURRENCY_LIMIT);

    // Add sync promises
    await syncMultipleResultsEventCreated({ startBlock, endBlock, syncPromises });
    await syncBetPlaced({ startBlock, endBlock, syncPromises });
    await syncResultSet({ startBlock, endBlock, syncPromises });
    await syncVotePlaced({ startBlock, endBlock, syncPromises });
    await syncVoteResultSet({ startBlock, endBlock, syncPromises });
    await syncWinningsWithdrawn({ startBlock, endBlock, syncPromises });
    syncBlocks({ startBlock, endBlock, syncPromises });

    // Add pending promises
    await pendingMultipleResultsEventCreated({ startBlock, syncPromises });
    await pendingBetPlaced({ startBlock, syncPromises });
    await pendingResultSet({ startBlock, syncPromises });
    await pendingVotePlaced({ startBlock, syncPromises });
    await pendingVoteResultSet({ startBlock, syncPromises });
    await pendingWinningsWithdrawn({ startBlock, syncPromises });
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

    delayThenSync(SYNC_START_DELAY);
  } catch (err) {
    throw err;
  }
};

module.exports = startSync;
