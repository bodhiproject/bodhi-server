const { each, isNull, find } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const EventSig = require('../config/event-sig');
const { toLowerCase } = require('../utils');
const { getTransactionReceipt } = require('../utils/web3-utils');
const logger = require('../utils/logger');
const DBHelper = require('../db/db-helper');
const parseEvent = require('./parsers/multiple-results-event');
const MultipleResultsEventApi = require('../api/multiple-results-event');
const EventLeaderboard = require('../models/event-leaderboard');
const GlobalLeaderboard = require('../models/global-leaderboard');

const getInvestments = async (txs) => {
  const accumulated = txs.reduce((acc, cur) => {
    const amount = web3.utils.toBN(cur.amount);
    if (!cur.betterAddress) cur.betterAddress = cur.centralizedOracleAddress;
    if (Object.keys(acc).includes(cur.betterAddress)) {
      acc[cur.betterAddress] = web3.utils.toBN(acc[cur.betterAddress]).add(amount).toString(10);
    } else {
      acc[cur.betterAddress] = amount.toString(10);
    }
    return acc;
  }, {});

  return accumulated;
};

const updateLeaderboardWithdrawing = async (syncPromises, events, limit) => {
  each(events, async (event) => {
    syncPromises.push(limit(async (eventObj) => {
      try {
        // get all the participants
        const bets = await DBHelper.findBet({
          eventAddress: eventObj.address,
          txStatus: TX_STATUS.SUCCESS,
        });
        const resultSets = await DBHelper.findResultSet({
          eventAddress: eventObj.address,
          txStatus: TX_STATUS.SUCCESS,
          eventRound: 0,
        });
        const txs = resultSets.concat(bets);
        const investments = await getInvestments(txs);
        const filtered = [];
        each(txs, (tx) => {
          if (!find(filtered, {
            eventAddress: tx.eventAddress,
            betterAddress: tx.betterAddress,
          })) {
            filtered.push(tx);
          }
        });
        // calculate winnings for all participants
        const promises = [];
        each(filtered, (tx) => {
          promises.push(new Promise(async (resolve, reject) => {
            try {
              const { eventAddress, betterAddress, resultIndex, centralizedOracleAddress } = tx;
              const userAddress = betterAddress || centralizedOracleAddress;
              // calculate winning for this user in this event
              let winnings = '0';
              if (resultIndex === eventObj.currentResultIndex) {
                const res = await MultipleResultsEventApi.calculateWinnings({
                  eventAddress,
                  address: userAddress,
                });
                winnings = res.toString(10);
              }
              // update event leaderboard winnings
              const eventLeaderboardEntry = new EventLeaderboard({
                eventAddress,
                userAddress,
                investments: '0', // event leaderboard entry already has user's investments
                winnings,
              });
              await DBHelper.insertEventLeaderboard(eventLeaderboardEntry);
              // update global leaderboard investments, winnings
              const globalLeaderboard = new GlobalLeaderboard({
                userAddress,
                investments: investments[userAddress],
                winnings,
              });
              await DBHelper.insertGlobalLeaderboard(globalLeaderboard);
              resolve();
            } catch (err) {
              reject(err);
            }
          }));
        });
        await Promise.all(promises);
      } catch (err) {
        logger.error(`UPDATE leaderboard when withdrawing status changed error: ${err.message}`);
        throw err;
      }
    }, event));
  });
};

const updateLeaderboard = async (
  { events, syncPromises, limit },
) => {
  try {
    await updateLeaderboardWithdrawing(syncPromises, events[1], limit);
  } catch (err) {
    logger.error('Error event status withdrawing changed');
    throw err;
  }
};

module.exports = updateLeaderboard;
