const { isEmpty, each } = require('lodash');

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

module.exports = {
  buildCursorOptions,
  buildEventFilters,
  buildEventSearchPhrase,
  buildBetFilters,
};
