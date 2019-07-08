const { uniqBy } = require('lodash');
const pLimit = require('p-limit');
const async = require('async');
const logger = require('../../utils/logger');
const DBHelper = require('../db-helper');
const { TX_STATUS, EVENT_STATUS } = require('../../constants');
const MultipleResultsEventApi = require('../../api/multiple-results-event');
const EventLeaderboard = require('../../models/event-leaderboard');

const PROMISE_CONCURRENCY_LIMIT = 15;
const limit = pLimit(PROMISE_CONCURRENCY_LIMIT);
async function helper (dbMethod, callback) {
  await dbMethod();
  callback();
}
async function migration2(next) {
  try {
    // migrate event leaderboard
    const events = await DBHelper.findEvent({ txStatus: TX_STATUS.SUCCESS });
    const promises = [];

    events.forEach(async (event, key) => {
      const eventAddress = event.address;
      const resultSet = await DBHelper.findResultSet({ eventRound: 0, txStatus: TX_STATUS.SUCCESS, eventAddress: event.address });
      const bets = await DBHelper.findBet({
        eventAddress: event.address,
        txStatus: TX_STATUS.SUCCESS,
      });
      const txs = resultSet.concat(bets);

      try {
        let i = 0;
        await async.whilst(
          check => check(null, i < txs.length), // trigger iter
          (next) => {
            const tx = txs[i];
            i++;

            try {
              const userAddress = tx.betterAddress || tx.centralizedOracleAddress;
              const eventLeaderboardEntry = new EventLeaderboard({
                eventAddress,
                userAddress,
                investments: tx.amount, // event leaderboard entry already has user's investments
                winnings: '0',
              });
              helper(() => DBHelper.insertEventLeaderboard(eventLeaderboardEntry),()=>next(null, i))
            } catch (err) {
              next(err, i); // err met, trigger the callback to end this loop
            }
          },
        );
      } catch (err) {
        // will only be called if should end this loop
        logger.error(err);
        throw err;
      }
      if (event.status === EVENT_STATUS.WITHDRAWING) {
        const addresses = new Set();
        txs.forEach((tx, index) => {
          if(tx.resultIndex !== event.currentResultIndex) return;
          if(tx.betterAddress) addresses.add(tx.betterAddress);
          if(tx.centralizedOracleAddress) addresses.add(tx.centralizedOracleAddress);
        })
        addresses.forEach((address, index) => {
          promises.push(limit(async () => {
            try {
              // calculate winning for this user in this event
              let winnings = '0';
              const res = await MultipleResultsEventApi.calculateWinnings({
                eventAddress,
                address: address,
              });
              winnings = res.toString(10);
              // update event leaderboard winnings
              const eventLeaderboardEntry = new EventLeaderboard({
                eventAddress,
                userAddress: address,
                investments: '0', // event leaderboard entry already has user's investments
                winnings,
              });
              await DBHelper.insertEventLeaderboard(eventLeaderboardEntry);
            } catch (err) {
              logger.error('Migrate event leaderboard error:', err);
            }
          }));
        });
      }
    });

    await Promise.all(promises);
    logger.info('Migration 2 done');
    next();
  } catch (err) {
    logger.error(`Migration 2 error: ${err.message}`);
    throw err;
  }
}

module.exports = migration2;
