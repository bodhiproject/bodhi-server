const { each, isNull } = require('lodash');
const updateEvent = require('./update-event');
const web3 = require('../web3');
const { CONFIG } = require('../config');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseResultSet = require('./parsers/result-set');

const syncResultSet = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.ResultSet],
    });
    logger.info(`Found ${logs.length} ResultSet`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(limit(async () => {
        try {
          // Parse and insert result set
          const resultSet = parseResultSet({ log });
          await DBHelper.insertResultSet(resultSet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(resultSet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);

          // Update event
          await updateEvent(resultSet);
        } catch (insertErr) {
          logger.error(`Error syncResultSet: ${insertErr.message}`);
          throw Error(`Error syncResultSet: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncResultSet getPastLogs:', err);
  }
};

const pendingResultSet = async ({ startBlock, syncPromises, limit }) => {
  try {
    // Find pending result sets that have a block number less than the startBlock
    const pending = await DBHelper.findResultSet(
      { txStatus: TX_STATUS.PENDING, blockNum: { $lt: startBlock }, eventRound: 0 },
      { blockNum: 1 },
    );
    if (pending.length === 0) return;
    logger.info(`Found ${pending.length} pending ResultSet`);

    // Determine range to search logs
    let fromBlock;
    let toBlock;
    each(pending, (p) => {
      const pBlock = p.blockNum;
      if (!fromBlock || pBlock < fromBlock) fromBlock = pBlock;
      if (!toBlock || pBlock > toBlock) toBlock = pBlock;
    });

    await syncResultSet({
      startBlock: fromBlock,
      endBlock: toBlock,
      syncPromises,
      limit,
    });
  } catch (err) {
    throw Error('Error pendingResultSet findResultSet:', err);
  }
};

const failedResultSets = async ({ startBlock, syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findResultSet({
      txStatus: TX_STATUS.PENDING,
      blockNum: { $lt: startBlock - CONFIG.FAILED_TX_BLOCK_THRESHOLD },
      eventRound: 0,
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} failed ResultSet`);

    each(pending, (p) => {
      syncPromises.push(limit(async () => {
        try {
          const txReceipt = await getTransactionReceipt(p.txid);
          if (!isNull(txReceipt) && !txReceipt.status) {
            await DBHelper.updateResultSet(p.txid, { txStatus: TX_STATUS.FAIL });
            await DBHelper.insertTransactionReceipt(txReceipt);
          }
        } catch (insertErr) {
          logger.error(`Error failedResultSets: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error('Error failedResultSets findResultSet:', err);
  }
};

module.exports = {
  syncResultSet,
  pendingResultSet,
  failedResultSets,
};
