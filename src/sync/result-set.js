const { each, isNull, find } = require('lodash');
const updateEvent = require('./update-event');
const web3 = require('../web3');
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
    throw Error(`Error syncResultSet: ${err.message}`);
  }
};

const pendingResultSet = async ({ syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findResultSet({
      txStatus: TX_STATUS.PENDING,
      eventRound: 0,
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} pending ResultSet`);

    each(pending, (p) => {
      syncPromises.push(limit(async () => {
        try {
          const txReceipt = await getTransactionReceipt(p.txid);
          if (isNull(txReceipt)) return;
          await DBHelper.insertTransactionReceipt(txReceipt);

          if (txReceipt.status) {
            // Parse individual log with success status
            const logs = await web3.eth.getPastLogs({
              fromBlock: txReceipt.blockNum,
              toBlock: txReceipt.blockNum,
              topics: [EventSig.ResultSet],
            });
            const foundLog = find(
              logs,
              log => log.transactionHash.toLowerCase() === txReceipt.transactionHash,
            );
            if (foundLog) {
              const resultSet = parseResultSet({ log: foundLog });
              await DBHelper.insertResultSet(resultSet);

              // Update event
              await updateEvent(resultSet);
            }
          } else {
            // Update result set with failed status
            await DBHelper.updateResultSet(p.txid, { txStatus: TX_STATUS.FAIL });
          }
        } catch (insertErr) {
          logger.error(`Error pendingResultSet: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error(`Error pendingResultSet findResultSet: ${err.message}`);
  }
};

module.exports = {
  syncResultSet,
  pendingResultSet,
};
