const { each, isNull, find } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const { toLowerCase, getAndInsertNames } = require('../utils');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseBet = require('./parsers/bet');
const EventLeaderboard = require('../models/event-leaderboard');

const syncBetPlaced = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.BetPlaced],
    });
    if (logs.length === 0) return;

    // Add to syncPromises array to be executed in parallel
    logger.info(`Found ${logs.length} BetPlaced`);
    each(logs, (log) => {
      syncPromises.push(limit(async (logObj) => {
        try {
          // Parse and insert bet
          const bet = parseBet({ log: logObj });
          await DBHelper.insertBet(bet);
          await getAndInsertNames(bet.betterAddress, DBHelper);
          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(bet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);

          // Update event leaderboard investments
          const leaderboardEntry = new EventLeaderboard({
            eventAddress: bet.eventAddress,
            userAddress: bet.betterAddress,
            investments: bet.amount,
            winnings: '0',
          });
          await DBHelper.insertEventLeaderboard(leaderboardEntry);
        } catch (insertErr) {
          logger.error('Error syncBetPlaced parse');
          throw insertErr;
        }
      }, log));
    });
  } catch (err) {
    logger.error('Error syncBetPlaced');
    throw err;
  }
};

const pendingBetPlaced = async ({ syncPromises, limit }) => {
  try {
    const pending = await DBHelper.findBet({
      txStatus: TX_STATUS.PENDING,
      eventRound: 0,
    });
    if (pending.length === 0) return;
    logger.info(`Checking ${pending.length} pending BetPlaced`);

    each(pending, (p) => {
      syncPromises.push(limit(async (pendingBet) => {
        try {
          const txReceipt = await getTransactionReceipt(pendingBet.txid);
          if (isNull(txReceipt)) return;
          await DBHelper.insertTransactionReceipt(txReceipt);

          if (txReceipt.status) {
            // Parse individual log with success status
            const logs = await web3.eth.getPastLogs({
              fromBlock: txReceipt.blockNum,
              toBlock: txReceipt.blockNum,
              topics: [EventSig.BetPlaced],
            });
            const foundLog = find(
              logs,
              log => toLowerCase(log.transactionHash) === txReceipt.transactionHash,
            );
            if (foundLog) {
              const bet = parseBet({ log: foundLog });
              await DBHelper.insertBet(bet);

              // Update event leaderboard investments
              const leaderboardEntry = new EventLeaderboard({
                eventAddress: bet.eventAddress,
                userAddress: bet.betterAddress,
                investments: bet.amount,
                winnings: '0',
              });
              await DBHelper.insertEventLeaderboard(leaderboardEntry);
            }
          } else {
            // Update bet with failed status
            await DBHelper.updateBet(
              txReceipt.transactionHash,
              { txStatus: TX_STATUS.FAIL },
            );
          }
        } catch (insertErr) {
          logger.error(`Error pendingBetPlaced: ${insertErr.message}`);
        }
      }, p));
    });
  } catch (err) {
    logger.error(`Error pendingBetPlaced findBet: ${err.message}`);
  }
};

module.exports = {
  syncBetPlaced,
  pendingBetPlaced,
};
