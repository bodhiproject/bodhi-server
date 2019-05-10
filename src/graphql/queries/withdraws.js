const { buildWithdrawFilters, runPaginatedQuery } = require('./utils');

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Withdraws } },
) => {
  const query = filter ? { $or: buildWithdrawFilters(filter) } : {};
  return runPaginatedQuery({
    db: Withdraws,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
