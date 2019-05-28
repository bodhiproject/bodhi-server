const { isEmpty, each, isNumber, toInteger } = require('lodash');
const web3 = require('../../web3');

const DEFAULT_LIMIT_NUM = 50;
const DEFAULT_SKIP_NUM = 0;

/**
 * Loops through the entire filter object and lowercases all of the filters
 * on the list of filters to lower.
 * @param {object} filters Filters to lowercase
 * @return {object} Lowercased filters
 */
const lowercaseFilters = (filters) => {
  if (!filters) return filters;
  const copy = filters;

  // List of filters that need to be lowercased
  const filtersToLower = [
    'txid',
    'address',
    'ownerAddress',
    'centralizedOracle',
    'excludeCentralizedOracle',
    'withdrawerAddress',
    'eventAddress',
    'betterAddress',
    'centralizedOracleAddress',
    'winnerAddress',
    'transactorAddress',
  ];

  // Loop through each filter
  each(copy, (value, key) => {
    // Handle root level filters
    if (filtersToLower.includes(key)) copy[key] = value.toLowerCase();

    // Handle OR filter array
    if (key === 'OR') {
      each(filters.OR, (orFilter, orIndex) => {
        each(orFilter, (orValue, orKey) => {
          if (filtersToLower.includes(orKey)) {
            copy.OR[orIndex][orKey] = orValue.toLowerCase();
          }
        });
      });
    }
  });
  return copy;
};

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
  const chainBlock = await web3.eth.getBlock('latest');
  return Math.floor((blockNum / chainBlock.number) * 100);
};

module.exports = {
  lowercaseFilters,
  buildCursorOptions,
  constructPageInfo,
  runPaginatedQuery,
  calculateSyncPercent,
};
