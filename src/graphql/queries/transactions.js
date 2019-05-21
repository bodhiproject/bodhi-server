const { concat, orderBy: order, slice } = require('lodash');
const { buildCursorOptions, constructPageInfo } = require('./utils');
const { ORDER_DIRECTION } = require('../../constants');

const buildTxFilters = ({
  eventAddress,
  transactorAddress,
} = {}) => {
  if (!eventAddress && !transactorAddress) {
    throw Error('eventAddress or transactorAddress missing in filters');
  }

  const filter = {};
  if (eventAddress) filter.eventAddress = eventAddress;
  if (transactorAddress) filter.transactorAddress = transactorAddress;
  return [filter];
};

const buildEventFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.address = eventAddress;
  if (transactorAddress) filters.ownerAddress = transactorAddress;
  return filters;
};

const buildBetFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.address = eventAddress;
  if (transactorAddress) filters.betterAddress = transactorAddress;
  return filters;
};

const buildResultSetFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.address = eventAddress;
  if (transactorAddress) filters.centralizedOracleAddress = transactorAddress;
  return filters;
};

const buildWithdrawFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.address = eventAddress;
  if (transactorAddress) filters.winnerAddress = transactorAddress;
  return filters;
};

module.exports = async (
  root,
  { filter, limit = 500, skip = 0 },
  { db: { Events, Bets, ResultSets, Withdraws } },
) => {
  const txFilters = buildTxFilters(filter);
  const orderBy = { blockNum: -1 };

  // Run Events query
  let cursor = Events.cfind(buildEventFilters(txFilters));
  cursor = buildCursorOptions(cursor, orderBy, limit);
  const events = await cursor.exec();

  // Run Bets query
  cursor = Bets.cfind(buildBetFilters(txFilters));
  cursor = buildCursorOptions(cursor, orderBy, limit);
  const bets = await cursor.exec();

  // Run ResultSets query
  cursor = ResultSets.cfind(buildResultSetFilters(txFilters));
  cursor = buildCursorOptions(cursor, orderBy, limit);
  const resultSets = await cursor.exec();

  // Run Withdraws query
  cursor = Withdraws.cfind(buildWithdrawFilters(txFilters));
  cursor = buildCursorOptions(cursor, orderBy, limit);
  const withdraws = await cursor.exec();

  // Combine to single list
  let txs = concat(events, bets, resultSets, withdraws);
  const totalCount = txs.length;

  // Order list by blockNum
  txs = order(txs, ['blockNum'], [ORDER_DIRECTION.DESCENDING.toLowerCase()]);

  // Slice list
  const end = Math.min(skip + limit, txs.length);
  txs = slice(txs, skip, end);

  return {
    totalCount,
    pageInfo: constructPageInfo(limit, skip, totalCount),
    items: txs,
  };
};
