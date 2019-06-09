const { each, isNull, find } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const { toLowerCase } = require('../utils');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseBet = require('./parsers/bet');

const syncVotePlaced = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.VotePlaced],
    });
    if (logs.length === 0) return;

    // Add to syncPromises array to be executed in parallel
    logger.info(`Found ${logs.length} VotePlaced`);
    each(logs, (log) => {
      syncPromises.push(limit(async () => {
        try {
          // Parse and insert vote
          const bet = parseBet({ log });
          await DBHelper.insertBet(bet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(bet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          logger.error('Error syncVotePlaced parse');
          throw insertErr;
        }
      }));
    });
  } catch (err) {
    logger.error('Error syncVotePlaced');
    throw err;
  }
};

const pendingVotePlaced = async ({ syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findBet({
      txStatus: TX_STATUS.PENDING,
      eventRound: { $gte: 1 },
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} pending VotePlaced`);

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
              topics: [EventSig.VotePlaced],
            });
            const foundLog = find(
              logs,
              log => toLowerCase(log.transactionHash) === txReceipt.transactionHash,
            );
            if (foundLog) {
              const bet = parseBet({ log: foundLog });
              await DBHelper.insertBet(bet);
            }
          } else {
            // Update bet with failed status
            await DBHelper.updateBet(
              txReceipt.transactionHash,
              { txStatus: TX_STATUS.FAIL },
            );
          }
        } catch (insertErr) {
          logger.error(`Error pendingVotePlaced: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error(`Error pendingVotePlaced findBet: ${err.message}`);
  }
};

module.exports = {
  syncVotePlaced,
  pendingVotePlaced,
};
