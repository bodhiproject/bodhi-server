const { isNull } = require('lodash');

const { getContractMetadata, isMainnet } = require('../config');
const { TOKEN, STATUS } = require('../constants');
const { web3 } = require('../web3');
const updateTransactions = require('./update-transactions');
const syncMultipleResultsEventCreated = require('./multiple-results-event-created');
const syncBetPlaced = require('./bet-placed');
const syncResultSet = require('./result-set');
const syncVotePlaced = require('./vote-placed');
const syncVoteResultSet = require('./vote-result-set');
const syncWinningsWithdrawn = require('./winnings-withdrawn');
const { db } = require('../db');
const { getLogger } = require('../utils/logger');
const { publishSyncInfo } = require('../graphql/subscriptions');

const SYNC_START_DELAY = 4000;
let contractMetadata;

/**
 * Starts the sync logic. It will loop indefinitely until cancelled.
 * @param shouldUpdateLocalTxs {Boolean} Should it update the local txs or not.
 */
const startSync = async (shouldUpdateLocalTxs) => {
  if (!contractMetadata) {
    contractMetadata = getContractMetadata();
    if (!contractMetadata) throw Error('No contract metadata found');
  }

  const currentBlockNum = await getStartBlock();
  const currentBlockTime = await getBlockTime(currentBlockNum);

  // If block time is null, then we are at latest block.
  if (isNull(currentBlockTime)) {
    delayThenSync(SYNC_START_DELAY, shouldUpdateLocalTxs);
    return;
  }

  getLogger().debug(`Syncing block ${currentBlockNum}`);

  if (shouldUpdateLocalTxs) {
    // TODO: need to update for naka?
    await updateTransactions(currentBlockNum);
    getLogger().debug('Updated local txs');
  }

  // Parse blockchain logs
  await syncMultipleResultsEventCreated(contractMetadata, currentBlockNum);
  await syncBetPlaced(contractMetadata, currentBlockNum);
  await syncResultSet(contractMetadata, currentBlockNum);
  await syncVotePlaced(contractMetadata, currentBlockNum);
  await syncVoteResultSet(contractMetadata, currentBlockNum);
  await syncWinningsWithdrawn(contractMetadata, currentBlockNum);

  await updateOraclesDoneVoting(currentBlockTime);
  await updateCOraclesDoneResultSet(currentBlockTime);
  await insertBlock(currentBlockNum, currentBlockTime);

  // Send syncInfo subscription message
  await publishSyncInfo(currentBlockNum, currentBlockTime);

  // No delay if next block is already confirmed
  delayThenSync(0, shouldUpdateLocalTxs);
};

/**
 * Delays for the specified time then calls startSync.
 * @param {number} delay Number of milliseconds to delay.
 * @param {boolean} shouldUpdateLocalTxs Should updateLocalTxs or not.
 */
const delayThenSync = (delay, shouldUpdateLocalTxs) => {
  getLogger().debug('sleep');
  setTimeout(() => {
    startSync(shouldUpdateLocalTxs);
  }, delay);
};

/**
 * Determines the start block to start syncing from.
 */
const getStartBlock = async () => {
  // Get deploy block of EventFactory
  let startBlock = isMainnet()
    ? contractMetadata.EventFactory.mainnetDeployBlock
    : contractMetadata.EventFactory.testnetDeployBlock;
  if (!startBlock) throw Error('Missing deploy block for EventFactory');

  // Check if last block synced is greater than the deploy block
  const blocks = await db.Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
  if (blocks.length > 0) {
    startBlock = Math.max(blocks[0].blockNum + 1, startBlock);
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
    const block = await web3.eth.getBlock(blockNum);
    if (isNull(block)) return block;
    return block.timestamp;
  } catch (err) {
    throw Error('Error getting block time:', err);
  }
};

// Update all Centralized and Decentralized Oracles statuses that are passed the endTime
const updateOraclesDoneVoting = async (currentBlockTime) => {
  try {
    await db.Oracles.update(
      { endTime: { $lt: currentBlockTime }, status: STATUS.VOTING },
      { $set: { status: STATUS.WAITRESULT } },
      { multi: true },
    );
  } catch (err) {
    getLogger().error(`updateOraclesDoneVoting: ${err.message}`);
  }
};

// Update Centralized Oracles to Open Result Set that are passed the resultSetEndTime
const updateCOraclesDoneResultSet = async (currentBlockTime) => {
  try {
    await db.Oracles.update(
      { resultSetEndTime: { $lt: currentBlockTime }, token: TOKEN.QTUM, status: STATUS.WAITRESULT },
      { $set: { status: STATUS.OPENRESULTSET } },
      { multi: true },
    );
  } catch (err) {
    getLogger().error(`updateCOraclesDoneResultSet: ${err.message}`);
  }
};

const insertBlock = async (currentBlockNum, currentBlockTime) => {
  try {
    await db.Blocks.insert({
      _id: currentBlockNum,
      blockNum: currentBlockNum,
      blockTime: currentBlockTime,
    });
    getLogger().debug(`Inserted block ${currentBlockNum}`);
  } catch (err) {
    getLogger().error(`insertBlock: ${err.message}`);
  }
};

module.exports = { startSync };
