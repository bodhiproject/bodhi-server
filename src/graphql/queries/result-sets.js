const { runPaginatedQuery } = require('./utils');

const buildFilters = ({
  OR = [],
  txid,
  eventAddress,
  centralizedOracleAddress,
  resultIndex,
  eventRound,
} = {}) => {
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
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { ResultSets } },
) => {
  const query = filter ? { $or: buildFilters(filter) } : {};
  return runPaginatedQuery({
    db: ResultSets,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
