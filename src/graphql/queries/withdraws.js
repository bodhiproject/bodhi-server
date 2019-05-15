const { runPaginatedQuery } = require('./utils');

const buildFilters = ({
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
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Withdraws } },
) => {
  const query = filter ? { $or: buildFilters(filter) } : {};
  return runPaginatedQuery({
    db: Withdraws,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
