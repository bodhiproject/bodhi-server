const { isNumber, toInteger } = require('lodash');
const { buildCursorOptions, buildEventFilters } = require('./utils');

module.exports = async (root, { filter, orderBy, limit, skip }, { db: { Events } }) => {
  const query = filter ? { $or: buildEventFilters(filter) } : {};
  let cursor = Events.cfind(query);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);

  const totalCount = await Events.count(query);
  let hasNextPage;
  let pageNumber;
  let isPaginated = false;

  if (isNumber(limit) && isNumber(skip)) {
    isPaginated = true;
    const end = skip + limit;
    hasNextPage = end < totalCount;
    // just in case, manually enter not start with new page, ex. limit 20, skip 2
    pageNumber = toInteger(end / limit);
  }

  const events = await cursor.exec();
  const res = { totalCount, events };
  if (isPaginated) {
    res.pageInfo = {
      hasNextPage,
      pageNumber,
      count: events.length,
    };
  }

  return res;
};
