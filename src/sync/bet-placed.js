const { each, isNull } = require('lodash');
const web3 = require('../web3');
const { CONFIG } = require('../config');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseBet = require('./parsers/bet');

const adjustStartBlock = async ({ startBlock }) => {
  try {
    // Find pending items
    const pending = await DBHelper.findBet({
      txStatus: TX_STATUS.PENDING,
      eventRound: 0,
    });
    logger.info(`Found ${pending.length} pending BetPlaced`);

    // Adjust startBlock if pending is earlier
    let fromBlock = startBlock;
    each(pending, (p) => {
      fromBlock = Math.min(fromBlock, p.blockNum);
    });
    return fromBlock;
  } catch (err) {
    throw Error('Error syncBetPlaced adjustStartBlock:', err);
  }
};

const syncBetPlaced = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const fromBlock = adjustStartBlock({ startBlock });
    const logs = await web3.eth.getPastLogs({
      fromBlock,
      toBlock: endBlock,
      topics: [EventSig.BetPlaced],
    });
    logger.info(`Getting BetPlaced logs ${fromBlock} - ${endBlock}`);
    logger.info(`Found ${logs.length} BetPlaced`);

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
          throw Error(`Error syncBetPlaced parseLog: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};

const failedBets = async ({ startBlock, syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findBet({
      txStatus: TX_STATUS.PENDING,
      blockNum: { $lt: startBlock - CONFIG.FAILED_TX_BLOCK_THRESHOLD },
      eventRound: 0,
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} failed BetPlaced`);

    each(pending, (p) => {
      syncPromises.push(limit(async () => {
        try {
          const txReceipt = await getTransactionReceipt(p.txid);
          if (!isNull(txReceipt) && !txReceipt.status) {
            await DBHelper.updateBet(p.txid, { txStatus: TX_STATUS.FAIL });
            await DBHelper.insertTransactionReceipt(txReceipt);
          }
        } catch (insertErr) {
          logger.error(`Error failedBets: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    logger.error('Error failedBets findBet:', err);
  }
};

module.exports = {
  syncBetPlaced,
  failedBets,
};
