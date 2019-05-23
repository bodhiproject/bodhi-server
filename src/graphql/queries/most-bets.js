const { each, isNumber, toInteger, isArray } = require('lodash');
const { lowercaseFilters } = require('./utils');
const { web3 } = require('../../web3');

const buildFilters = ({
  OR,
  eventAddress,
} = {}) => {
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = filters.concat(buildFilters(f));
    });
    return filters;
  }

  // Handle other fields
  const filter = {};
  if (eventAddress) filter.eventAddress = eventAddress;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

// TODO: implement orderBy
module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  const result = await Bets.find(query);
  const naka = web3();

  const accumulated = result.reduce((acc, cur) => {
    const amount = naka.utils.toBN(cur.amount);
    if (Object.keys(acc).includes(cur.betterAddress)) {
      acc[cur.betterAddress] = naka.utils.toBN(acc[cur.betterAddress]).add(amount);
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
