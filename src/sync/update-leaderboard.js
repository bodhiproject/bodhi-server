const { each, find } = require('lodash');
const async = require('async');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const DBHelper = require('../db/db-helper');
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

const getWinnings = async (eventAddress, address, investments, callback) => {
  try {
    const res = await MultipleResultsEventApi.calculateWinnings({
      eventAddress,
      address,
    });
    const winnings = res.toString(10);
    await insertLeaderboards(eventAddress, address, winnings, investments, callback);
  } catch (err) {
    throw err;
  }
};

const insertLeaderboards = async (eventAddress, userAddress, winnings, investments, callback) => {
  try {
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
      investments,
      winnings,
    });
    await DBHelper.insertGlobalLeaderboard(globalLeaderboard);
    callback();
  } catch (err) {
    throw err;
  }
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
        await async.eachOfSeries(filtered, (value, key, callback) => {
          try {
            const { eventAddress, betterAddress, centralizedOracleAddress } = value;
            const userAddress = betterAddress || centralizedOracleAddress;
            // calculate winning for this user in this event
            getWinnings(eventAddress, userAddress, investments[userAddress], callback);
          } catch (err) {
            callback(err);
          }
        }, (err) => {
          if (err) {
            logger.error(err.message);
            throw err;
          }
        });
      } catch (err) {
        logger.error(`UPDATE leaderboard when withdrawing status changed error: ${err.message}`);
        throw err;
      }
    }, event));
  });
};

const updateLeaderboard = async (
  { newWithdrawEvents, syncPromises, limit },
) => {
  try {
    await updateLeaderboardWithdrawing(syncPromises, newWithdrawEvents[1], limit);
  } catch (err) {
    logger.error('Error event status withdrawing changed');
    throw err;
  }
};

module.exports = updateLeaderboard;
