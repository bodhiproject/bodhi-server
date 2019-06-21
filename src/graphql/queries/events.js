const { isArray, each, isNumber } = require('lodash');
const { lowercaseFilters, runPaginatedQuery } = require('./utils');

const errCOracleFilterConflict =
  Error('Cannot have both centralizedOracle and excludeCentralizedOracle filters');

const buildFilters = (rawFilter = {}) => {
  const {
    OR,
    versions,
  } = rawFilter;
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = filters.concat(buildFilters(f));
    });
    return filters;
  }

  // Handle other fields
  if (versions) {
    each(versions, (version) => {
      const subfilter = buildFilter(rawFilter, version);
      if (Object.keys(subfilter).length > 0) filters.push(subfilter);
    });
  } else {
    const subfilter = buildFilter(rawFilter, undefined);
    if (Object.keys(subfilter).length > 0) filters.push(subfilter);
  }

  return filters;
};

const buildFilter = (rawFilter, version) => {
  const {
    txid,
    txStatus,
    address,
    ownerAddress,
    centralizedOracle,
    excludeCentralizedOracle,
    currentRound,
    currentResultIndex,
    status,
    language,
  } = rawFilter;
  const filter = {};
  if (txid) filter.txid = txid;
  if (txStatus) filter.txStatus = txStatus;
  if (address) filter.address = address;
  if (ownerAddress) filter.ownerAddress = ownerAddress;
  if (isNumber(version)) filter.version = version;

  if (centralizedOracle) {
    if (excludeCentralizedOracle) throw errCOracleFilterConflict;
    filter.centralizedOracle = centralizedOracle;
  } else if (excludeCentralizedOracle) {
    if (centralizedOracle) throw errCOracleFilterConflict;
    filter.centralizedOracle = { $ne: excludeCentralizedOracle };
  }

  if (isNumber(currentRound)) filter.currentRound = currentRound;
  if (isNumber(currentResultIndex)) filter.currentResultIndex = currentResultIndex;
  if (status) filter.status = status;
  if (language) filter.language = language;

  return filter;
} 

module.exports = async (
  parent,
  { filter, orderBy, limit, skip, pendingTxsAddress, includeRoundBets, roundBetsAddress },
  context,
) => {
  const { db: { Events } } = context;
  context.pendingTxsAddress = pendingTxsAddress;
  context.includeRoundBets = includeRoundBets;
  context.roundBetsAddress = roundBetsAddress;
  const query = filter ? { $or: buildFilters(lowercaseFilters(filter)) } : {};
  return runPaginatedQuery({
    db: Events,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
