const BigNumber = require('bignumber.js');
const { eachOfSeries } = require('async');

const { lowercaseFilters, runPaginatedQuery } = require('./utils');
const DBHelper = require('../../db/db-helper');

const buildFilters = ({
  userAddress,
  eventAddress,
} = {}) => {
  if (!eventAddress && !userAddress) {
    throw Error('eventAddress and/or userAddress missing in filters');
  }
  const filters = [];
  const filter = {};
  if (eventAddress) filter.eventAddress = eventAddress;
  if (userAddress) filter.userAddress = userAddress;

  filters.push(filter);
  return filters;
};

const eventLeaderboardEntries = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { EventLeaderboard } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  const res = await runPaginatedQuery({
    db: EventLeaderboard,
    filter: query,
    orderBy,
    limit,
    skip,
  });

  await eachOfSeries(res.items, async element => {
    const nameEntry = await DBHelper.findOneName({address: element.userAddress});
    element.userName = nameEntry && nameEntry.name;
  });

  if (orderBy && orderBy.length > 0) {
    const { field } = orderBy[0];
    if (field !== 'eventAddress' && field !== 'userAddress') {
      res.items.sort((a, b) => new BigNumber(b[field]).comparedTo(new BigNumber(a[field]))); // all descending
    }
  }

  return res;
};

const globalLeaderboardEntries = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { GlobalLeaderboard } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  const res = await runPaginatedQuery({
    db: GlobalLeaderboard,
    filter: query,
    orderBy,
    limit,
    skip,
  });

  await eachOfSeries(res.items, async element => {
    const nameEntry = await DBHelper.findOneName({address: element.userAddress});
    element.userName = nameEntry && nameEntry.name;
  });

  if (orderBy && orderBy.length > 0) {
    const { field } = orderBy[0];
    if (field !== 'eventAddress' && field !== 'userAddress') {
      res.items.sort((a, b) => new BigNumber(b[field]).comparedTo(new BigNumber(a[field]))); // all descending
    }
  }

  return res;
};

module.exports = {
  eventLeaderboardEntries,
  globalLeaderboardEntries,
};
