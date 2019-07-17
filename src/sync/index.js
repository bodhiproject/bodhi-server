const pLimit = require('p-limit');
const moment = require('moment');
const { isNumber } = require('lodash');
const { eventFactoryMeta, isMainnet } = require('../config');
const { EVENT_MESSAGE } = require('../constants');
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
const updateLeaderboard = require('./update-leaderboard');
const DBHelper = require('../db/db-helper');
const logger = require('../utils/logger');
const { publishSyncInfo } = require('../graphql/subscriptions');
const emitter = require('../event');

const SYNC_START_DELAY = 3000;
const BLOCK_BATCH_COUNT = 500;
const PROMISE_CONCURRENCY_LIMIT = 15;

const limit = pLimit(PROMISE_CONCURRENCY_LIMIT);
let wsConnected = false;
let syncPromises = [];
let startBlock;

/**
 * Event listener for websocket connected.
 */
const onWebsocketConnected = () => {
  wsConnected = true;
};

/**
 * Event listener for websocket disconnected.
 */
const onWebsocketDisconnected = () => {
  wsConnected = false;
};

/**
 * Registers all event listeners.
 */
const registerListeners = () => {
  emitter.addListener(EVENT_MESSAGE.WEBSOCKET_CONNECTED, onWebsocketConnected);
  emitter.addListener(EVENT_MESSAGE.WEBSOCKET_DISCONNECTED, onWebsocketDisconnected);
};

/**
 * Initial setup before starting the sync.
 */
const initSync = () => {
  registerListeners();
};

/**
 * Determines the start block to start syncing from.
 */
const getStartBlock = async () => {
  let start;

  const blocks = await DBHelper.findLatestBlock();
  if (blocks.length > 0) {
    // Blocks found in DB. Use the highest block num minus the block batch count.
    // We need to reparse the previously parsed blocks because the blocks are added
    // async and there may be blocks missing in the middle.
    start = isNumber(blocks[0].blockNum)
      ? Math.max(0, blocks[0].blockNum - BLOCK_BATCH_COUNT)
      : 0;
  } else {
    // No blocks found in DB, use earliest version's deploy block
    const contractMeta = eventFactoryMeta(6);
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
  setTimeout(() => {
    startSync();
  }, delay);
};

/**
 * Starts the sync logic. It will loop indefinitely until cancelled.
 */
const startSync = async () => {
  try {
    // TODO: enable code when web3 websockets fixed
    // Don't allow sync if websocket is not connected
    // if (!wsConnected) {
    //   delayThenSync(SYNC_START_DELAY);
    //   return;
    // }

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
    await DBHelper.updateEventStatusPreResultSetting(blockTime);
    await DBHelper.updateEventStatusOracleResultSetting(blockTime);
    await DBHelper.updateEventStatusOpenResultSetting(blockTime);
    await DBHelper.updateEventStatusArbitration(blockTime);
    const newWithdrawEvents = await DBHelper.updateEventStatusWithdrawing(blockTime);
    syncPromises = [];
    await updateLeaderboard({ newWithdrawEvents, syncPromises, limit });
    await Promise.all(syncPromises);

    // Send syncInfo subscription message
    await publishSyncInfo(endBlock, blockTime);

    // Display exec time
    const execTimeMs = moment().valueOf() - execStartMs;
    logger.info(`Completed in ${execTimeMs} ms`);

    // Set startBlock for next sync
    startBlock = endBlock + 1;

    delayThenSync(SYNC_START_DELAY);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  initSync,
  startSync,
};
