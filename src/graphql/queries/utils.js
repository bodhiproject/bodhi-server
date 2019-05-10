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

const buildEventFilters = ({
  OR = [],
  txid,
  address,
  ownerAddress,
  resultIndex,
  hashId,
  status,
  language,
}) => {
  const filter = (
    txid
    || address
    || ownerAddress
    || resultIndex
    || hashId
    || status
    || language
  ) ? {} : null;

  if (txid) filter.txid = txid;
  if (address) filter.address = address;
  if (ownerAddress) filter.ownerAddress = ownerAddress;
  if (status) filter.status = status;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (hashId) filter.hashId = hashId;
  if (language) filter.language = language;

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildEventFilters(OR[i]));
  }
  return filters;
};

const buildEventSearchPhrase = (searchPhrase) => {
  const filterFields = ['_id', 'name', 'address', 'centralizedOracle'];
  if (!searchPhrase) return [];

  const filters = [];
  const searchRegex = new RegExp(`.*${searchPhrase}.*`, 'i');
  for (let i = 0; i < filterFields.length; i++) {
    const filter = {};
    filter[filterFields[i]] = { $regex: searchRegex };
    filters.push(filter);
  }

  return filters;
};

const buildBetFilters = ({
  OR = [],
  txid,
  eventAddress,
  betterAddress,
  resultIndex,
  eventRound,
}) => {
  const filter = (
    txid
    || eventAddress
    || betterAddress
    || resultIndex
    || eventRound
  ) ? {} : null;

  if (txid) filter.txid = txid;
  if (eventAddress) filter.eventAddress = eventAddress;
  if (betterAddress) filter.betterAddress = betterAddress;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (eventRound) filter.eventRound = eventRound;

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildBetFilters(OR[i]));
  }
  return filters;
};

const buildResultSetFilters = ({
  OR = [],
  txid,
  eventAddress,
  centralizedOracleAddress,
  resultIndex,
  eventRound,
}) => {
  const filter = (
    txid
    || eventAddress
    || centralizedOracleAddress
    || resultIndex
    || eventRound
  ) ? {} : null;

  if (txid) filter.txid = txid;
  if (eventAddress) filter.eventAddress = eventAddress;
  if (centralizedOracleAddress) filter.centralizedOracleAddress = centralizedOracleAddress;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (eventRound) filter.eventRound = eventRound;

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildResultSetFilters(OR[i]));
  }
  return filters;
};

const buildWithdrawFilters = ({
  OR = [],
  txid,
  eventAddress,
  winnerAddress,
}) => {
  const filter = (
    txid
    || eventAddress
    || winnerAddress
  ) ? {} : null;

  if (txid) filter.txid = txid;
  if (eventAddress) filter.eventAddress = eventAddress;
  if (winnerAddress) filter.winnerAddress = winnerAddress;

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildWithdrawFilters(OR[i]));
  }
  return filters;
};

const calculateSyncPercent = async (blockNum) => {
  const chainBlock = await web3.eth.getBlock('latest');
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
  buildEventFilters,
  buildEventSearchPhrase,
  buildBetFilters,
  buildResultSetFilters,
  buildWithdrawFilters,
  calculateSyncPercent,
  runPaginatedQuery,
};
