const { failedMultipleResultsEventCreated } = require('./multiple-results-event-created');
const { failedBets } = require('./bet-placed');
const { failedResultSets } = require('./result-set');
const { failedVotePlaced } = require('./vote-placed');
const { failedVoteResultSets } = require('./vote-result-set');
const { failedWinningsWithdrawn } = require('./winnings-withdrawn');

// Check for failed txs every x number of blocks
const BLOCK_CHECK_INTERVAL = 1200;

module.exports = async ({ startBlock, endBlock, syncPromises, limit }) => {
  let check = false;
  for (let i = startBlock; i <= endBlock; i++) {
    if (i % BLOCK_CHECK_INTERVAL === 0) {
      check = true;
      break;
    }
  }

  if (check) {
    await failedMultipleResultsEventCreated({ startBlock, syncPromises, limit });
    await failedBets({ startBlock, syncPromises, limit });
    await failedResultSets({ startBlock, syncPromises, limit });
    await failedVotePlaced({ startBlock, syncPromises, limit });
    await failedVoteResultSets({ startBlock, syncPromises, limit });
    await failedWinningsWithdrawn({ startBlock, syncPromises, limit });
  }
};
