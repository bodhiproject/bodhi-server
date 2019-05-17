const { uniqBy, each } = require('lodash');
const { runPaginatedQuery } = require('./utils');
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

  let bets = await DBHelper.findBet(db, { betterAddress: withdrawerAddress });
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
  const { version, language } = filter;
  const filters = [];

  each(bets, (bet) => {
    const currFilter = {
      status: EVENT_STATUS.WITHDRAWING,
      address: bet.eventAddress,
      currentResultIndex: bet.resultIndex,
    };
    if (version) currFilter.version = version;
    if (language) currFilter.language = language;
    filters.push(currFilter);
  });

  return filters;
};

module.exports = async (parent, { filter, orderBy, limit, skip }, { db }) => {
  const bets = await getUniqueBets(filter.withdrawerAddress, db);
  const query = { $or: buildFilters(bets, filter) };
  return runPaginatedQuery({
    db: db.Events,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
