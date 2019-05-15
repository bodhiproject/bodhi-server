const events = require('./events');
const searchEvents = require('./events');
const bets = require('./bets');
const resultSets = require('./result-sets');
const withdraws = require('./withdraws');
const transactions = require('./transactions');
const syncInfo = require('./sync-info');
const allStats = require('./all-stats');
const mostBets = require('./most-bets');
const biggestWinners = require('./biggest-winners');

module.exports = {
  events,
  searchEvents,
  bets,
  resultSets,
  withdraws,
  transactions,
  syncInfo,
  allStats,
  mostBets,
  biggestWinners,
};
