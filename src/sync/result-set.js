const { each } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseResultSet = require('./parsers/result-set');

const syncResultSet = async ({ startBlock, endBlock, syncPromises }) => {
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
      syncPromises.push(new Promise(async (resolve, reject) => {
        try {
          // Parse and insert result set
          const resultSet = await parseResultSet({ log });
          await DBHelper.insertResultSet(resultSet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(resultSet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);

          resolve();
        } catch (insertErr) {
          logger.error(`insert ResultSet: ${insertErr.message}`);
          reject();
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncResultSet:', err);
  }
};

const pendingResultSet = async ({ startBlock, syncPromises }) => {
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
    });
  } catch (err) {
    throw Error('Error pendingResultSet:', err);
  }
};

module.exports = {
  syncResultSet,
  pendingResultSet,
};
