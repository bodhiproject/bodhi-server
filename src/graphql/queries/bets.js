const { isNumber, toInteger } = require('lodash');
const { buildCursorOptions, buildBetFilters } = require('./utils');

module.exports = async (root, { filter, orderBy, limit, skip }, { db: { Bets } }) => {
  const query = filter ? { $or: buildBetFilters(filter) } : {};
  let cursor = Bets.cfind(query);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);

  const totalCount = await Bets.count(query);
  let hasNextPage;
  let pageNumber;
  let isPaginated = false;

  if (isNumber(limit) && isNumber(skip)) {
    isPaginated = true;
    const end = skip + limit;
    hasNextPage = end < totalCount;
    pageNumber = toInteger(end / limit);
  }

  const bets = await cursor.exec();
  const res = { totalCount, bets };
  if (isPaginated) {
    res.pageInfo = {
      hasNextPage,
      pageNumber,
      count: bets.length,
    };
  }

  return res;
};
