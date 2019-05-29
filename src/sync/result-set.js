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

const adjustStartBlock = async ({ startBlock }) => {
  try {
    // Find pending items
    const pending = await DBHelper.findResultSet({
      txStatus: TX_STATUS.PENDING,
      eventRound: 0,
    });
    if (pending.length > 0) {
      logger.info(`Found ${pending.length} pending ResultSet`);
    }

    // Adjust startBlock if pending is earlier
    let fromBlock = startBlock;
    each(pending, (p) => {
      fromBlock = Math.min(fromBlock, p.blockNum);
    });
    return fromBlock;
  } catch (err) {
    throw Error('Error syncResultSet adjustStartBlock:', err);
  }
};

const syncResultSet = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const fromBlock = await adjustStartBlock({ startBlock });
    const logs = await web3.eth.getPastLogs({
      fromBlock,
      toBlock: endBlock,
      topics: [EventSig.ResultSet],
    });
    logger.info(`Search ResultSet logs ${fromBlock} - ${endBlock}`);
    if (logs.length > 0) logger.info(`Found ${logs.length} ResultSet`);

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
          throw Error(`Error syncResultSet parse: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncResultSet:', err);
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
  failedResultSets,
};
