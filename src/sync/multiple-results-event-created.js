const { each, isNull, find } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const EventSig = require('../config/event-sig');
const { toLowerCase } = require('../utils');
const { getTransactionReceipt } = require('../utils/web3-utils');
const logger = require('../utils/logger');
const DBHelper = require('../db/db-helper');
const parseEvent = require('./parsers/multiple-results-event');

const syncMultipleResultsEventCreated = async (
  { startBlock, endBlock, syncPromises, limit },
) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.MultipleResultsEventCreated],
    });
    if (logs.length === 0) return;

    // Add to syncPromises array to be executed in parallel
    logger.info(`Found ${logs.length} MultipleResultsEventCreated`);
    each(logs, (log) => {
      syncPromises.push(limit(async () => {
        try {
          // Parse and insert event
          const event = await parseEvent({ log });
          await DBHelper.insertEvent(event);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(event.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          logger.error('Error syncMultipleResultsEventCreated parse');
          throw insertErr;
        }
      }));
    });
  } catch (err) {
    logger.error('Error syncMultipleResultsEventCreated');
    throw err;
  }
};

const pendingMultipleResultsEventCreated = async ({ syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findEvent({ txStatus: TX_STATUS.PENDING });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} pending MultipleResultsEventCreated`);

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
              topics: [EventSig.MultipleResultsEventCreated],
            });
            const foundLog = find(
              logs,
              log => toLowerCase(log.transactionHash) === txReceipt.transactionHash,
            );
            if (foundLog) {
              const event = await parseEvent({ log: foundLog });
              await DBHelper.insertEvent(event);
            }
          } else {
            // Update event with failed status
            await DBHelper.updateEvent(
              txReceipt.transactionHash,
              { txStatus: TX_STATUS.FAIL },
            );
          }
        } catch (insertErr) {
          logger.error('Error pendingMultipleResultsEventCreated');
          throw insertErr;
        }
      }));
    });
  } catch (err) {
    logger.error(`Error pendingMultipleResultsEventCreated findEvent: ${err.message}`);
  }
};

module.exports = {
  syncMultipleResultsEventCreated,
  pendingMultipleResultsEventCreated,
};
