const { each, isNull, find } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const { toLowerCase, getAndInsertNames } = require('../utils');
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
    if (logs.length === 0) return;

    // Add to syncPromises array to be executed in parallel
    logger.info(`Found ${logs.length} WinningsWithdrawn`);
    each(logs, (log) => {
      syncPromises.push(limit(async (logObj) => {
        try {
          // Parse and insert withdraw
          const withdraw = parseWithdraw({ log: logObj });
          await DBHelper.insertWithdraw(withdraw);
          await getAndInsertNames(withdraw.winnerAddress, DBHelper);
          // Add withdrawer into event withdrawnList
          await DBHelper.updateEventWithdrawnList(withdraw);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(withdraw.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          logger.error('Error syncWinningsWithdrawn parse');
          throw insertErr;
        }
      }, log));
    });
  } catch (err) {
    logger.error('Error syncWinningsWithdrawn');
    throw err;
  }
};

const pendingWinningsWithdrawn = async ({ syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findWithdraw({ txStatus: TX_STATUS.PENDING });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} pending WinningsWithdrawn`);

    each(pending, (p) => {
      syncPromises.push(limit(async (pendingWithdraw) => {
        try {
          const txReceipt = await getTransactionReceipt(pendingWithdraw.txid);
          if (isNull(txReceipt)) return;
          await DBHelper.insertTransactionReceipt(txReceipt);

          if (txReceipt.status) {
            // Parse individual log with success status
            const logs = await web3.eth.getPastLogs({
              fromBlock: txReceipt.blockNum,
              toBlock: txReceipt.blockNum,
              topics: [EventSig.WinningsWithdrawn],
            });
            const foundLog = find(
              logs,
              log => toLowerCase(log.transactionHash) === txReceipt.transactionHash,
            );
            if (foundLog) {
              const withdraw = parseWithdraw({ log: foundLog });
              await DBHelper.insertWithdraw(withdraw);
              // Add withdrawer into event withdrawnList
              await DBHelper.updateEventWithdrawnList(withdraw);
            }
          } else {
            // Update withdraw with failed status
            await DBHelper.updateWithdraw(
              txReceipt.transactionHash,
              { txStatus: TX_STATUS.FAIL },
            );
          }
        } catch (insertErr) {
          logger.error(`Error pendingWinningsWithdrawn: ${insertErr.message}`);
        }
      }, p));
    });
  } catch (err) {
    logger.error(`Error pendingWinningsWithdrawn findWithdraw: ${err.message}`);
  }
};

module.exports = {
  syncWinningsWithdrawn,
  pendingWinningsWithdrawn,
};
