const { buildResultSetFilters, runPaginatedQuery } = require('./utils');

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { ResultSets } },
) => {
  const query = filter ? { $or: buildResultSetFilters(filter) } : {};
  return runPaginatedQuery({
    db: ResultSets,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
