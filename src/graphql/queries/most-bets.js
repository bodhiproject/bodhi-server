const { each, isNumber, toInteger, isArray } = require('lodash');
const { lowercaseFilters } = require('./utils');
const web3 = require('../../web3');
const DBHelper = require('../../db/db-helper');
const { TX_STATUS } = require('../../constants');

const buildBetFilters = ({
  OR,
  eventAddress,
} = {}) => {
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = filters.concat(buildBetFilters(f));
    });
    return filters;
  }

  // Handle other fields
  const filter = {};
  if (eventAddress) filter.eventAddress = eventAddress;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

const buildResultSetFilters = ({
  OR,
  eventAddress,
} = {}) => {
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = filters.concat(buildResultSetFilters(f));
    });
    return filters;
  }

  // Handle other fields
  const filter = {
    txStatus: TX_STATUS.SUCCESS,
    eventRound: 0,
  };
  if (eventAddress) filter.eventAddress = eventAddress;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};
// TODO: implement orderBy
module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  {},
) => {
  const query = filter ? { $or: buildBetFilters(lowercaseFilters(filter)) } : {};
  let result = await DBHelper.findBet(query);
  const resultSetFilter = filter ? { $or: buildResultSetFilters(lowercaseFilters(filter)) } : {};

  const resultSet = await DBHelper.findResultSet(resultSetFilter);
  if (resultSet && result.length != 0) {
    result = result.concat(resultSet);
  }

  const accumulated = result.reduce((acc, cur) => {
    const amount = web3.utils.toBN(cur.amount);
    // centralizedOracleAddress is the better address in result set
    if (!cur.betterAddress) cur.betterAddress = cur.centralizedOracleAddress;
    if (Object.keys(acc).includes(cur.betterAddress)) {
      acc[cur.betterAddress] = web3.utils.toBN(acc[cur.betterAddress]).add(amount);
    } else {
      acc[cur.betterAddress] = amount;
    }
    return acc;
  }, {});

  let items = Object.keys(accumulated).map(key => ({
    betterAddress: key,
    amount: accumulated[key].toString(10),
  }));
  items.sort((a, b) => b.amount - a.amount);

  const totalCount = items.length;
  let hasNextPage;
  let pageNumber;
  let isPaginated = false;

  if (isNumber(limit) && isNumber(skip)) {
    isPaginated = true;
    const end = skip + limit;
    hasNextPage = end < totalCount;
    pageNumber = toInteger(end / limit);
    items = items.splice(skip, end);
  }

  const pageInfo = isPaginated
    ? { hasNextPage, pageNumber, count: items.length }
    : undefined;

  return {
    totalCount,
    pageInfo,
    items,
  };
};
