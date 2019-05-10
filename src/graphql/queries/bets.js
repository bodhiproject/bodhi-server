const { buildBetFilters, runPaginatedQuery } = require('./utils');

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const query = filter ? { $or: buildBetFilters(filter) } : {};
  return runPaginatedQuery({
    db: Bets,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
