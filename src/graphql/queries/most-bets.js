const { isNumber, toInteger } = require('lodash');
const { buildBetFilters } = require('./utils');
const { web3 } = require('../../web3');

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const betFilters = buildBetFilters(filter);
  if (betFilters.length !== 1) throw Error('only one event is allowed');

  const query = filter ? { $or: betFilters } : {};
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
    eventAddress: betFilters[0].eventAddress,
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
