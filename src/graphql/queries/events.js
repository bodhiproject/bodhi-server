const { buildEventFilters, runPaginatedQuery } = require('./utils');

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Events } },
) => {
  const query = filter ? { $or: buildEventFilters(filter) } : {};
  return runPaginatedQuery({
    db: Events,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
