const fs = require('fs-extra');
const pLimit = require('p-limit');
const { isUndefined } = require('lodash');
const moment = require('moment');
const { eventFactoryMeta, isMainnet, getBaseDataDir } = require('../config');
const web3 = require('../web3');
const {
  syncMultipleResultsEventCreated,
  pendingMultipleResultsEventCreated,
} = require('./multiple-results-event-created');
const { syncBetPlaced, pendingBetPlaced } = require('./bet-placed');
const { syncResultSet, pendingResultSet } = require('./result-set');
const { syncVotePlaced, pendingVotePlaced } = require('./vote-placed');
const { syncVoteResultSet, pendingVoteResultSet } = require('./vote-result-set');
const {
  syncWinningsWithdrawn,
  pendingWinningsWithdrawn,
} = require('./winnings-withdrawn');
const syncBlocks = require('./blocks');
const DBHelper = require('../db/db-helper');
const logger = require('../utils/logger');
const { publishSyncInfo } = require('../graphql/subscriptions');

const SYNC_START_DELAY = 3000;
const BLOCK_BATCH_COUNT = 500;
const PROMISE_CONCURRENCY_LIMIT = 30;
const START_BLOCK_FILENAME = 'start_block.dat';

const limit = pLimit(PROMISE_CONCURRENCY_LIMIT);
let syncPromises = [];
let signalsHandled = false;
let startBlock;

/**
 * Checks if the start block file exists, and returns the start block if so.
 * @return {number|undefined} Block where the sync stopped last
 */
const readStartBlockFile = () => {
  try {
    const filePath = `${getBaseDataDir()}/${START_BLOCK_FILENAME}`;
    if (fs.existsSync(filePath)) {
      logger.info('Found start block config');
      const start = fs.readFileSync(filePath);
      fs.removeSync(filePath);
      return Number(start);
    }
  } catch (err) {
    logger.error('Could not read start block file');
  }
  return undefined;
};

/**
 * Writes the start block to a temp file so when the sync is started again,
 * it can use the start block where the error occurred or when the sync was stopped.
 */
const writeStartBlockFile = () => {
  if (isUndefined(startBlock)) return;

  const filePath = `${getBaseDataDir()}/${START_BLOCK_FILENAME}`;
  fs.writeFileSync(filePath, `${startBlock}`);
};

/**
 * Sets up event signal handlers for when the sync is stopped.
 */
const setupSignalHandler = () => {
  const onShutdown = () => {
    writeStartBlockFile();
    process.exit(0);
  };

  process
    .on('SIGINT', () => onShutdown())
    .on('SIGTERM', () => onShutdown());
  signalsHandled = true;
};

/**
 * Determines the start block to start syncing from.
 */
const getStartBlock = async () => {
  let start;

  // Tries to get start block from start block file
  start = readStartBlockFile();
  if (start) return start;

  const blocks = await DBHelper.findLatestBlock();
  if (blocks.length > 0) {
    // Blocks found in DB, use the last synced block as start
    start = blocks[0].blockNum + 1;
  } else {
    // No blocks found in DB, use earliest version's deploy block
    const contractMeta = eventFactoryMeta(5);
    start = isMainnet()
      ? contractMeta.mainnetDeployBlock
      : contractMeta.testnetDeployBlock;
  }
  return start;
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
    if (!signalsHandled) setupSignalHandler();

    // Track exec time
    const execStartMs = moment().valueOf();

    // Determine start and end blocks
    const latestBlock = await web3.eth.getBlockNumber();
    startBlock = startBlock || await getStartBlock();
    const endBlock = Math.min(startBlock + BLOCK_BATCH_COUNT, latestBlock);

    logger.info(`Syncing blocks ${startBlock} - ${endBlock}`);

    // Events need to be synced before all other types to avoid race conditions
    // when updating the event.
    syncPromises = [];
    await syncMultipleResultsEventCreated({
      startBlock,
      endBlock,
      syncPromises,
      limit,
    });
    await Promise.all(syncPromises);
    syncPromises = [];
    await pendingMultipleResultsEventCreated({ syncPromises, limit });
    await Promise.all(syncPromises);

    // Handle event actions and blocks
    syncPromises = [];
    await syncBetPlaced({ startBlock, endBlock, syncPromises, limit });
    await syncResultSet({ startBlock, endBlock, syncPromises, limit });
    await syncVotePlaced({ startBlock, endBlock, syncPromises, limit });
    await syncVoteResultSet({ startBlock, endBlock, syncPromises, limit });
    await syncWinningsWithdrawn({ startBlock, endBlock, syncPromises, limit });
    syncBlocks({ startBlock, endBlock, syncPromises, limit });
    await Promise.all(syncPromises);

    // Handle pending event actions
    syncPromises = [];
    await pendingBetPlaced({ syncPromises, limit });
    await pendingResultSet({ syncPromises, limit });
    await pendingVotePlaced({ syncPromises, limit });
    await pendingVoteResultSet({ syncPromises, limit });
    await pendingWinningsWithdrawn({ syncPromises, limit });
    await Promise.all(syncPromises);

    // Update statuses
    const { blockTime } = await DBHelper.findOneBlock({ blockNum: endBlock });
    await DBHelper.updateEventStatusPreBetting(blockTime);
    await DBHelper.updateEventStatusBetting(blockTime);
    await DBHelper.updateEventStatusOracleResultSetting(blockTime);
    await DBHelper.updateEventStatusOpenResultSetting(blockTime);
    await DBHelper.updateEventStatusArbitration(blockTime);
    await DBHelper.updateEventStatusWithdrawing(blockTime);

    // Send syncInfo subscription message
    await publishSyncInfo(endBlock, blockTime);

    // Display exec time
    const execTimeMs = moment().valueOf() - execStartMs;
    logger.info(`Completed in ${execTimeMs} ms`);

    // Set startBlock for next sync
    startBlock = endBlock + 1;

    delayThenSync(SYNC_START_DELAY);
  } catch (err) {
    writeStartBlockFile();
    throw err;
  }
};

module.exports = startSync;
