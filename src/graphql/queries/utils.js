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

const constructPageInfo = (limit, skip, totalCount) => {
  if (!isNumber(limit) || !isNumber(skip)) return undefined;

  const end = skip + limit;
  const hasNextPage = end < totalCount;
  const pageNumber = toInteger(end / limit);
  const count = hasNextPage ? limit : (totalCount % limit);

  return {
    hasNextPage,
    pageNumber,
    count,
  };
};

const runPaginatedQuery = async ({ db, filter, orderBy, limit, skip }) => {
  let cursor = db.cfind(filter);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);

  const totalCount = await db.count(filter);
  const pageInfo = constructPageInfo(limit, skip, totalCount);
  const items = await cursor.exec();

  return {
    totalCount,
    pageInfo,
    items,
  };
};

const calculateSyncPercent = async (blockNum) => {
  const chainBlock = await web3().eth.getBlock('latest');
  return Math.floor((blockNum / chainBlock.number) * 100);
};

module.exports = {
  buildCursorOptions,
  constructPageInfo,
  runPaginatedQuery,
  calculateSyncPercent,
};
