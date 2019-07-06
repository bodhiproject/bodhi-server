const { isArray, each } = require('lodash');
const { lowercaseFilters, runPaginatedQuery } = require('./utils');

const buildFilters = ({
  userAddress,
  eventAddress,
} = {}) => {
  if (!eventAddress && !userAddress) {
    throw Error('eventAddress or userAddress missing in filters');
  }
  const filters = [];
  const filter = {};
  if (eventAddress) filter.eventAddress = eventAddress;
  if (userAddress) filter.userAddress = userAddress;

  filters.push(filter);
  return filters;
};

const eventLeaderboard = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { EventLeaderboard } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  return runPaginatedQuery({
    db: EventLeaderboard,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};

const globalLeaderboard = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { GlobalLeaderboard } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  return runPaginatedQuery({
    db: GlobalLeaderboard,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};

module.exports = {
  eventLeaderboard,
  globalLeaderboard,
};
