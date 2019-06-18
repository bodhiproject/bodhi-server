const { concat, orderBy: order, slice } = require('lodash');
const { lowercaseFilters, buildCursorOptions, constructPageInfo } = require('./utils');
const { ORDER_DIRECTION, TX_TYPE, TX_STATUS } = require('../../constants');

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
  filter.txStatus = TX_STATUS.PENDING;
  return filter;
};

const buildEventFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.address = eventAddress;
  if (transactorAddress) filters.ownerAddress = transactorAddress;
  filters.txStatus = TX_STATUS.PENDING;
  return filters;
};

const buildBetFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.eventAddress = eventAddress;
  if (transactorAddress) filters.betterAddress = transactorAddress;
  filters.txStatus = TX_STATUS.PENDING;
  return filters;
};

const buildResultSetFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.eventAddress = eventAddress;
  if (transactorAddress) filters.centralizedOracleAddress = transactorAddress;
  filters.eventRound = 0;
  filters.txStatus = TX_STATUS.PENDING;
  return filters;
};

const buildWithdrawFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.eventAddress = eventAddress;
  if (transactorAddress) filters.winnerAddress = transactorAddress;
  filters.txStatus = TX_STATUS.PENDING;
  return filters;
};

module.exports = async (
  root,
  { filter },
  { db: { Events, Bets, ResultSets, Withdraws } },
) => {
  const txFilters = buildTxFilters(lowercaseFilters(filter));
  const orderBy = [{ field: 'blockNum', direction: ORDER_DIRECTION.DESCENDING }];

  // Run Events query
  const eventFilter = buildEventFilters(txFilters);
  let cursor = Events.cfind(eventFilter);
  cursor = buildCursorOptions(cursor, orderBy);
  const events = await cursor.exec();

  // Run Bets query
  const betFilter = buildBetFilters(txFilters);
  cursor = Bets.cfind(betFilter);
  cursor = buildCursorOptions(cursor, orderBy);
  const bets = await cursor.exec();

  // Run ResultSets query
  const resultSetFilter = buildResultSetFilters(txFilters);
  cursor = ResultSets.cfind(resultSetFilter);
  cursor = buildCursorOptions(cursor, orderBy);
  const resultSets = await cursor.exec();

  // Run Withdraws query
  const withdrawFilter = buildWithdrawFilters(txFilters);
  cursor = Withdraws.cfind(withdrawFilter);
  cursor = buildCursorOptions(cursor, orderBy);
  const withdraws = await cursor.exec();

  // Combine to single list
  let txs = concat(events, bets, resultSets, withdraws);

  // Order list by blockNum
  txs = order(txs, ['blockNum'], [ORDER_DIRECTION.DESCENDING.toLowerCase()]);

  return txs;
};
