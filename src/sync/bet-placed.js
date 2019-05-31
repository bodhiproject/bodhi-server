const { each, isNull, find } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseBet = require('./parsers/bet');

const syncBetPlaced = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.BetPlaced],
    });
    if (logs.length > 0) logger.info(`Found ${logs.length} BetPlaced`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(limit(async () => {
        try {
          // Parse and insert bet
          const bet = parseBet({ log });
          await DBHelper.insertBet(bet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(bet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          throw Error(`Error syncBetPlaced parse: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error(`Error syncBetPlaced: ${err.message}`);
  }
};

const pendingBets = async ({ syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findBet({
      txStatus: TX_STATUS.PENDING,
      eventRound: 0,
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} pending Bet`);

    each(pending, (p) => {
      syncPromises.push(limit(async () => {
        try {
          const txReceipt = await getTransactionReceipt(p.txid);
          if (isNull(txReceipt)) return;

          if (txReceipt.status) {
            // Parse individual log with success status
            const logs = await web3.eth.getPastLogs({
              fromBlock: txReceipt.blockNum,
              toBlock: txReceipt.blockNum,
              topics: [EventSig.BetPlaced],
            });
            const foundLog = find(
              logs,
              log => log.transactionHash.toLowerCase() === txReceipt.transactionHash,
            );
            if (foundLog) {
              const bet = parseBet({ log: foundLog });
              await DBHelper.insertBet(bet);
            }
          } else {
            // Update bet with failed status
            await DBHelper.updateBet(p.txid, { txStatus: TX_STATUS.FAIL });
          }
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          logger.error(`Error pendingBets: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error(`Error pendingBets findBet: ${err.message}`);
  }
};

module.exports = {
  syncBetPlaced,
  pendingBets,
};
