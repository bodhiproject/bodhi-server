const { concat, orderBy: order, slice } = require('lodash');
const { lowercaseFilters, buildCursorOptions, constructPageInfo } = require('./utils');
const { ORDER_DIRECTION, TX_TYPE } = require('../../constants');

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
  return filter;
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
  if (eventAddress) filters.eventAddress = eventAddress;
  if (transactorAddress) filters.betterAddress = transactorAddress;
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
  return filters;
};

const buildWithdrawFilters = ({
  eventAddress,
  transactorAddress,
}) => {
  const filters = {};
  if (eventAddress) filters.eventAddress = eventAddress;
  if (transactorAddress) filters.winnerAddress = transactorAddress;
  return filters;
};

module.exports = async (
  root,
  { filter, limit = 10, skip = 0, skips: { eventSkip, betSkip, resultSetSkip, withdrawSkip } },
  { db: { Events, Bets, ResultSets, Withdraws } },
) => {
  const txFilters = buildTxFilters(lowercaseFilters(filter));
  const orderBy = [{ field: 'blockNum', direction: ORDER_DIRECTION.DESCENDING }];
  let totalCount = 0;
  // Run Events query
  const eventFilter = buildEventFilters(txFilters);
  totalCount += await Events.count(eventFilter);
  let cursor = Events.cfind(eventFilter);
  cursor = buildCursorOptions(cursor, orderBy, limit, eventSkip);
  const events = await cursor.exec();

  // Run Bets query
  const betFilter = buildBetFilters(txFilters);
  totalCount += await Bets.count(betFilter);
  cursor = Bets.cfind(betFilter);
  cursor = buildCursorOptions(cursor, orderBy, limit, betSkip);
  const bets = await cursor.exec();

  // Run ResultSets query
  const resultSetFilter = buildResultSetFilters(txFilters);
  totalCount += await ResultSets.count(resultSetFilter);
  cursor = ResultSets.cfind(resultSetFilter);
  cursor = buildCursorOptions(cursor, orderBy, limit, resultSetSkip);
  const resultSets = await cursor.exec();

  // Run Withdraws query
  const withdrawFilter = buildWithdrawFilters(txFilters);
  totalCount += await Withdraws.count(withdrawFilter);
  cursor = Withdraws.cfind(withdrawFilter);
  cursor = buildCursorOptions(cursor, orderBy, limit, withdrawSkip);
  const withdraws = await cursor.exec();

  // Combine to single list
  let txs = concat(events, bets, resultSets, withdraws);

  // Order list by blockNum
  txs = order(txs, ['blockNum'], [ORDER_DIRECTION.DESCENDING.toLowerCase()]);

  // Slice list
  txs = slice(txs, 0, limit);

  const pageInfo = constructPageInfo(limit, skip, totalCount);
  pageInfo.nextSkips = {
    nextEventSkip: eventSkip + txs.filter(tx => tx.txType === TX_TYPE.CREATE_EVENT).length,
    nextBetSkip: betSkip + txs.filter(tx => tx.txType === TX_TYPE.BET
                                        || tx.txType === TX_TYPE.VOTE).length,
    nextResultSetSkip: resultSetSkip + txs.filter(tx => tx.txType === TX_TYPE.RESULT_SET).length,
    nextWithdrawSkip: withdrawSkip + txs.filter(tx => tx.txType === TX_TYPE.WITHDRAW).length,
  };

  return {
    totalCount,
    pageInfo,
    items: txs,
  };
};
