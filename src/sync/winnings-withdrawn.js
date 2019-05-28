const { each, isNull } = require('lodash');
const web3 = require('../web3');
const { CONFIG } = require('../config');
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
          logger.error(`Error syncWinningsWithdrawn: ${insertErr.message}`);
          throw Error(`Error syncWinningsWithdrawn: ${insertErr.message}`);
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
    throw Error('Error pendingWinningsWithdrawn findWithdraw:', err);
  }
};

const failedWinningsWithdrawn = async ({ startBlock, syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findWithdraw({
      txStatus: TX_STATUS.PENDING,
      blockNum: { $lt: startBlock - CONFIG.FAILED_TX_BLOCK_THRESHOLD },
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} failed WinningsWithdrawn`);

    each(pending, (p) => {
      syncPromises.push(limit(async () => {
        try {
          const txReceipt = await getTransactionReceipt(p.txid);
          if (!isNull(txReceipt) && !txReceipt.status) {
            await DBHelper.updateWithdraw(p.txid, { txStatus: TX_STATUS.FAIL });
            await DBHelper.insertTransactionReceipt(txReceipt);
          }
        } catch (insertErr) {
          logger.error(`Error failedWinningsWithdrawn: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error('Error failedWinningsWithdrawn findWithdraw:', err);
  }
};

module.exports = {
  syncWinningsWithdrawn,
  pendingWinningsWithdrawn,
  failedWinningsWithdrawn,
};
