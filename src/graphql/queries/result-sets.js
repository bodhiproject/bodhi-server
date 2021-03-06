const { isArray, each } = require('lodash');
const { lowercaseFilters, runPaginatedQuery } = require('./utils');

const buildFilters = ({
  OR,
  txid,
  txStatus,
  eventAddress,
  centralizedOracleAddress,
  resultIndex,
  eventRound,
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
  if (txid) filter.txid = txid;
  if (txStatus) filter.txStatus = txStatus;
  if (eventAddress) filter.eventAddress = eventAddress;
  if (centralizedOracleAddress) filter.centralizedOracleAddress = centralizedOracleAddress;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (eventRound) filter.eventRound = eventRound;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { ResultSets } },
) => {
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  return runPaginatedQuery({
    db: ResultSets,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
