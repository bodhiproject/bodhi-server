const { each, find, orderBy: _orderBy } = require('lodash');
const MultipleResultsEventApi = require('../../api/multiple-results-event');

const buildFilters = ({ eventAddress }) => {
  if (!eventAddress) throw Error('eventAddress missing in filters');

  const filters = { eventAddress };
  return filters;
};

// TODO: implement orderBy, limit, skip (pagination)
module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const filters = buildFilters(filter);
  const query = filter ? { $or: filters } : {};
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
  let winnings = [];
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
  winnings = _orderBy(winnings, ['amount'], ['desc']);

  return winnings;
};
