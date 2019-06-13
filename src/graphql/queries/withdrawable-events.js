const { uniqBy, each } = require('lodash');
const { lowercaseFilters, runPaginatedQuery } = require('./utils');
const DBHelper = require('../../db/db-helper');
const { EVENT_STATUS } = require('../../constants');

/**
 * Gets all the unique bets for the withdrawer.
 * @param {string} withdrawerAddress Withdrawer address
 * @param {object} db DB context
 * @return {array} Array of unique bets by the withdrawer
 */
const getUniqueBets = async (withdrawerAddress, db) => {
  if (!withdrawerAddress) throw Error('Must include withdrawerAddress filter');

  let bets = await DBHelper.findBet({ betterAddress: withdrawerAddress });
  bets = uniqBy(bets, b => [b.eventAddress, b.resultIndex].join());
  return bets;
};

/**
 * Builds all the event filters based on events that have the same winning result index.
 * @param {array} bets Array of unique bets by the withdrawer
 * @param {object} filter Filters passed in to the query
 * @return {array} Array of filters for the events query.
 */
const buildFilters = (bets, filter) => {
  const { version, language, withdrawerAddress } = filter;
  const filters = [];
  // for user created events
  filters.push({ status: EVENT_STATUS.WITHDRAWING, ownerAddress: withdrawerAddress });
  each(bets, (bet) => {
    const currFilter = {
      status: EVENT_STATUS.WITHDRAWING,
      address: bet.eventAddress,
    };
    // final result invalid, betting round user should be able to see the events for withdraw
    if (bet.eventRound == 0) {
      currFilter.$or = [{ currentResultIndex: bet.resultIndex }, { currentResultIndex: 0 }];
    } else {
      currFilter.currentResultIndex = bet.resultIndex;
    }
    if (version) currFilter.version = version;
    if (language) currFilter.language = language;
    filters.push(currFilter);
  });

  return filters;
};

module.exports = async (parent, { filter, orderBy, limit, skip, includeRoundBets, roundBetsAddress }, context) => {
  const { db } = context;
  const filters = lowercaseFilters(filter);
  const bets = await getUniqueBets(filters.withdrawerAddress, db);
  const query = { $or: buildFilters(bets, filters) };
  context.includeRoundBets = includeRoundBets;
  context.roundBetsAddress = roundBetsAddress;

  return runPaginatedQuery({
    db: db.Events,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
