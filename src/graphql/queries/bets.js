const { runPaginatedQuery } = require('./utils');

const buildFilters = ({
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
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Bets } },
) => {
  const query = filter ? { $or: buildFilters(filter) } : {};
  return runPaginatedQuery({
    db: Bets,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
