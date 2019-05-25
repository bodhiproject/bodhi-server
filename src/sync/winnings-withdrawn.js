const { each } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseWithdraw = require('./parsers/withdraw');

const syncWinningsWithdrawn = async (
  { startBlock, endBlock, syncPromises, limit },
) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.WinningsWithdrawn],
    });
    logger.info(`Found ${logs.length} WinningsWithdrawn`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(limit(async () => {
        try {
          // Parse and insert withdraw
          const withdraw = parseWithdraw({ log });
          await DBHelper.insertWithdraw(withdraw);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(withdraw.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          logger.error(`insert WinningsWithdrawn: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncWinningsWithdrawn:', err);
  }
};

const pendingWinningsWithdrawn = async (
  { startBlock, syncPromises, limit },
) => {
  try {
    // Find pending winnings withdrawn that have a block number less than the startBlock
    const pending = await DBHelper.findWithdraw(
      { txStatus: TX_STATUS.PENDING, blockNum: { $lt: startBlock } },
      { blockNum: 1 },
    );
    if (pending.length === 0) return;
    logger.info(`Found ${pending.length} pending WinningsWithdrawn`);

    // Determine range to search logs
    let fromBlock;
    let toBlock;
    each(pending, (p) => {
      const pBlock = p.blockNum;
      if (!fromBlock || pBlock < fromBlock) fromBlock = pBlock;
      if (!toBlock || pBlock > toBlock) toBlock = pBlock;
    });

    await syncWinningsWithdrawn({
      startBlock: fromBlock,
      endBlock: toBlock,
      syncPromises,
      limit,
    });
  } catch (err) {
    throw Error('Error pendingWinningsWithdrawn:', err);
  }
};

module.exports = {
  syncWinningsWithdrawn,
  pendingWinningsWithdrawn,
};
