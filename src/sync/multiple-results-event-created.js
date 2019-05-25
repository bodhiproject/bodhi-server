const { each } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const EventSig = require('../config/event-sig');
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
          logger.error(`insert MultipleResultsEventCreated: ${insertErr.message}`);
          throw Error(`insert MultipleResultsEventCreated: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncMultipleResultsEventCreated:', err);
  }
};

const pendingMultipleResultsEventCreated = async (
  { startBlock, syncPromises, limit },
) => {
  try {
    // Find pending events that have a block number less than the startBlock
    const pending = await DBHelper.findEvent(
      { txStatus: TX_STATUS.PENDING, blockNum: { $lt: startBlock } },
      { blockNum: 1 },
    );
    if (pending.length === 0) return;
    logger.info(`Found ${pending.length} pending MultipleResultsEventCreated`);

    // Determine range to search logs
    let fromBlock;
    let toBlock;
    each(pending, (p) => {
      const pBlock = p.blockNum;
      if (!fromBlock || pBlock < fromBlock) fromBlock = pBlock;
      if (!toBlock || pBlock > toBlock) toBlock = pBlock;
    });

    await syncMultipleResultsEventCreated({
      startBlock: fromBlock,
      endBlock: toBlock,
      syncPromises,
      limit,
    });
  } catch (err) {
    throw Error('Error pendingMultipleResultsEventCreated:', err);
  }
};

module.exports = {
  syncMultipleResultsEventCreated,
  pendingMultipleResultsEventCreated,
};
