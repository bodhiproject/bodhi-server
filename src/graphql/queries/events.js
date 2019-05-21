const { isArray, each, isNumber } = require('lodash');
const { runPaginatedQuery } = require('./utils');

const errCOracleFilterConflict =
  Error('Cannot have both centralizedOracle and excludeCentralizedOracle filters');

const buildFilters = ({
  OR,
  txid,
  txStatus,
  address,
  ownerAddress,
  version,
  centralizedOracle,
  excludeCentralizedOracle,
  currentRound,
  currentResultIndex,
  status,
  language,
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

  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

module.exports = async (
  parent,
  { filter, orderBy, limit, skip, pendingTxsAddress, includeRoundBets },
  context,
) => {
  const { db: { Events } } = context;
  context.pendingTxsAddress = pendingTxsAddress;
  context.includeRoundBets = includeRoundBets;

  const query = filter ? { $or: buildFilters(filter) } : {};
  return runPaginatedQuery({
    db: Events,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
