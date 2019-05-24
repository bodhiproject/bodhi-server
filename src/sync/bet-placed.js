const { each } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const EventSig = require('../config/event-sig');
const parseBet = require('./parsers/bet-placed');
const DBHelper = require('../db/db-helper');

const syncBetPlaced = async ({ startBlock, endBlock, syncPromises }) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.BetPlaced],
    });
    logger.info(`Found ${logs.length} BetPlaced`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(new Promise(async (resolve, reject) => {
        try {
          // Parse and insert bet
          const bet = await parseBet({ log });
          await DBHelper.insertBet(bet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(bet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);

          resolve();
        } catch (insertErr) {
          logger.error(`insert BetPlaced: ${insertErr.message}`);
          reject();
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};

const pendingBetPlaced = async ({ startBlock, syncPromises }) => {
  try {
    // Find pending bets that have a block number less than the startBlock
    const pending = await DBHelper.findBet(
      { txStatus: TX_STATUS.PENDING, blockNum: { $lt: startBlock }, eventRound: 0 },
      { blockNum: 1 },
    );
    if (pending.length === 0) return;
    logger.info(`Found ${pending.length} pending BetPlaced`);

    // Determine range to search logs
    let fromBlock;
    let toBlock;
    each(pending, (pendingBet) => {
      const betBlock = pendingBet.blockNum;
      if (!fromBlock || betBlock < fromBlock) fromBlock = betBlock;
      if (!toBlock || betBlock > toBlock) toBlock = betBlock;
    });

    await syncBetPlaced({
      startBlock: fromBlock,
      endBlock: toBlock,
      syncPromises,
    });
  } catch (err) {
    throw Error('Error pendingBetPlaced:', err);
  }
};

module.exports = {
  syncBetPlaced,
  pendingBetPlaced,
};
