const { checkFailedBets } = require('./bet-placed');

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
    await checkFailedBets({ startBlock, syncPromises, limit });
  }
};
