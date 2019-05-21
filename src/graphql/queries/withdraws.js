const { isArray, each } = require('lodash');
const { runPaginatedQuery } = require('./utils');

const buildFilters = ({
  OR,
  txid,
  eventAddress,
  winnerAddress,
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
  if (eventAddress) filter.eventAddress = eventAddress;
  if (winnerAddress) filter.winnerAddress = winnerAddress;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Withdraws } },
) => {
  const query = filter ? { $or: buildFilters(filter) } : {};
  return runPaginatedQuery({
    db: Withdraws,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
