const { isArray, each } = require('lodash');
const { lowercaseFilters, runPaginatedQuery } = require('./utils');

const buildFilters = ({
  OR,
  txid,
  txStatus,
  eventAddress,
  betterAddress,
  resultIndex,
  eventRound,
} = {}) => {
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = filters.concat(buildFilters(f));
    });
    return filters;
  }

  // Handle other fields
  const filter = {};
  if (txid) filter.txid = txid;
  if (txStatus) filter.txStatus = txStatus;
  if (eventAddress) filter.eventAddress = eventAddress;
  if (betterAddress) filter.betterAddress = betterAddress;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (eventRound) filter.eventRound = eventRound;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  return runPaginatedQuery({
    db: Bets,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
