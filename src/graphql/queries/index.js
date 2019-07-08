const events = require('./events');
const searchEvents = require('./search-events');
const bets = require('./bets');
const resultSets = require('./result-sets');
const withdraws = require('./withdraws');
const transactions = require('./transactions');
const syncInfo = require('./sync-info');
const totalResultBets = require('./total-result-bets');
const allStats = require('./all-stats');
const mostBets = require('./most-bets');
const biggestWinners = require('./biggest-winners');
const withdrawableEvents = require('./withdrawable-events');
const { eventLeaderboardEntries, globalLeaderboardEntries } = require('./leaderboard');

module.exports = {
  events,
  searchEvents,
  bets,
  resultSets,
  withdraws,
  transactions,
  syncInfo,
  totalResultBets,
  allStats,
  mostBets,
  biggestWinners,
  withdrawableEvents,
  eventLeaderboardEntries,
  globalLeaderboardEntries,
};
