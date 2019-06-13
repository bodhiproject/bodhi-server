const { each, find, orderBy: _orderBy, isArray, isNumber, toInteger } = require('lodash');
const { lowercaseFilters } = require('./utils');
const MultipleResultsEventApi = require('../../api/multiple-results-event');

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

// TODO: implement orderBy, limit, skip (pagination)
module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  const bets = await Bets.find(query);

  const filtered = [];
  each(bets, (bet) => {
    if (!find(filtered, {
      eventAddress: bet.eventAddress,
      betterAddress: bet.betterAddress,
    })) {
      filtered.push(bet);
    }
  });

  const promises = [];
  const winnings = [];
  each(filtered, (bet) => {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const { eventAddress, betterAddress } = bet;
        const res = await MultipleResultsEventApi.calculateWinnings({
          eventAddress,
          address: betterAddress,
        });
        winnings.push({
          eventAddress,
          betterAddress,
          amount: res.toString(10),
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    }));
  });
  await Promise.all(promises);
  let items = _orderBy(winnings, ['amount'], ['desc']);

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
