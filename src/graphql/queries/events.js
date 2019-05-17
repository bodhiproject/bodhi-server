const { isNumber } = require('lodash');
const { runPaginatedQuery } = require('./utils');

const errCOracleFilterConflict =
  Error('Cannot have both centralizedOracle and excludeCentralizedOracle filters');

const buildFilters = ({
  OR = [],
  txid,
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
  const filter = {};
  if (txid) filter.txid = txid;
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

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
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
