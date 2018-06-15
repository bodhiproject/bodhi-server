const { getContractMetadata, isMainnet } = require('../config');
const { db, DBHelper } = require('../db/nedb');

let contractMetadata;

const sync = async () => {
  contractMetadata = getContractMetadata();
  const startBlock = await getStartBlock();
};

// Returns the starting block to start syncing
const getStartBlock = async () => {
  let startBlock = contractMetadata.contractDeployedBlock;
  if (!startBlock) {
    throw Error('Missing startBlock in contract metadata.');
  }

  const blocks = await db.Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
  if (blocks.length > 0) {
    startBlock = Math.max(blocks[0].blockNum + 1, startBlock);
  }

  return startBlock;
};
