const { uniq } = require('lodash');
const logger = require('../../utils/logger');
const DBHelper = require('../db-helper');
const { getAndInsertNames } = require('../../utils');

async function migration3(next) {
  try {
    let addresses = [];
    const events = await DBHelper.findEvent();
    events.forEach((element) => {
      addresses.push(element.ownerAddress);
    });
    const bets = await DBHelper.findBet();
    bets.forEach((element) => {
      addresses.push(element.betterAddress);
    });
    const resultSets = await DBHelper.findResultSet({ eventRound: 0 });
    resultSets.forEach((element) => {
      addresses.push(element.centralizedOracleAddress);
    });
    addresses = uniq(addresses);

    await getAndInsertNames(addresses, DBHelper);
    logger.info('Migration 3 done');
    next();
  } catch (err) {
    logger.error(`Migration 3 error: ${err.message}`);
    throw err;
  }
}

module.exports = migration3;
