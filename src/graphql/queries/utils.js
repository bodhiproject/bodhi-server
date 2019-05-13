const { isEmpty, each, isNumber, toInteger } = require('lodash');
const { web3 } = require('../../web3');

const DEFAULT_LIMIT_NUM = 50;
const DEFAULT_SKIP_NUM = 0;

const buildCursorOptions = (cursor, orderBy, limit, skip) => {
  if (!isEmpty(orderBy)) {
    const sortDict = {};
    each(orderBy, (order) => {
      sortDict[order.field] = order.direction === 'ASC' ? 1 : -1;
    });

    cursor.sort(sortDict);
  }

  cursor.limit(limit || DEFAULT_LIMIT_NUM);
  cursor.skip(skip || DEFAULT_SKIP_NUM);

  return cursor;
};

const calculateSyncPercent = async (blockNum) => {
  const chainBlock = await web3().eth.getBlock('latest');
  Math.floor((blockNum / chainBlock) * 100);
};

const runPaginatedQuery = async ({ db, filter, orderBy, limit, skip }) => {
  let cursor = db.cfind(filter);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);

  const totalCount = await db.count(filter);
  let hasNextPage;
  let pageNumber;
  let isPaginated = false;

  if (isNumber(limit) && isNumber(skip)) {
    isPaginated = true;
    const end = skip + limit;
    hasNextPage = end < totalCount;
    pageNumber = toInteger(end / limit);
  }

  const items = await cursor.exec();
  const pageInfo = isPaginated
    ? { hasNextPage, pageNumber, count: items.length }
    : undefined;
  return {
    totalCount,
    pageInfo,
    items,
  };
};

module.exports = {
  buildCursorOptions,
  calculateSyncPercent,
  runPaginatedQuery,
};
