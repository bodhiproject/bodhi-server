const { each, isNull } = require('lodash');
const web3 = require('../web3');
const { CONFIG } = require('../config');
const { TX_STATUS } = require('../constants');
const EventSig = require('../config/event-sig');
const { getTransactionReceipt } = require('../utils/web3-utils');
const logger = require('../utils/logger');
const DBHelper = require('../db/db-helper');
const parseEvent = require('./parsers/multiple-results-event');

const adjustStartBlock = async ({ startBlock }) => {
  try {
    // Find pending items
    const pending = await DBHelper.findEvent({ txStatus: TX_STATUS.PENDING });
    logger.info(`Found ${pending.length} pending MultipleResultsEventCreated`);

    // Adjust startBlock if pending is earlier
    let fromBlock = startBlock;
    each(pending, (p) => {
      fromBlock = Math.min(fromBlock, p.blockNum);
    });
    return fromBlock;
  } catch (err) {
    throw Error('Error syncMultipleResultsEventCreated adjustStartBlock:', err);
  }
};

const syncMultipleResultsEventCreated = async (
  { startBlock, endBlock, syncPromises, limit },
) => {
  try {
    // Fetch logs
    const fromBlock = adjustStartBlock({ startBlock });
    const logs = await web3.eth.getPastLogs({
      fromBlock,
      toBlock: endBlock,
      topics: [EventSig.MultipleResultsEventCreated],
    });
    logger.info(`Search MultipleResultsEventCreated logs ${fromBlock} - ${endBlock}`);
    logger.info(`Found ${logs.length} MultipleResultsEventCreated`);

    // Add to syncPromises array to be executed in parallel
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
          throw Error(`Error syncMultipleResultsEventCreated parse: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncMultipleResultsEventCreated:', err);
  }
};

const failedMultipleResultsEventCreated = async ({ startBlock, syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findEvent({
      txStatus: TX_STATUS.PENDING,
      blockNum: { $lt: startBlock - CONFIG.FAILED_TX_BLOCK_THRESHOLD },
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} failed MultipleResultsEventCreated`);

    each(pending, (p) => {
      syncPromises.push(limit(async () => {
        try {
          const txReceipt = await getTransactionReceipt(p.txid);
          if (!isNull(txReceipt) && !txReceipt.status) {
            await DBHelper.updateEvent(p.txid, { txStatus: TX_STATUS.FAIL });
            await DBHelper.insertTransactionReceipt(txReceipt);
          }
        } catch (insertErr) {
          logger.error(`Error failedMultipleResultsEventCreated: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error('Error failedMultipleResultsEventCreated findEvent:', err);
  }
};

module.exports = {
  syncMultipleResultsEventCreated,
  failedMultipleResultsEventCreated,
};
