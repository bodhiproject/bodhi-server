const _ = require('lodash');
const moment = require('moment');

const { addressBalances } = require('./queries');
const pubsub = require('../pubsub');
const { getInstance } = require('../qclient');
const Network = require('../api/network');
const { getLogger } = require('../utils/logger');

const SYNC_THRESHOLD_SECS = 1200;
const BLOCK_0_TIMESTAMP = 1504695029;

// Gets the highest synced block number from connected peers
const peerHighestSyncedHeader = async () => {
  let peerBlockHeader = null;
  try {
    const res = await getInstance().getPeerInfo();
    _.each(res, (nodeInfo) => {
      if (_.isNumber(nodeInfo.synced_headers) && nodeInfo.synced_headers !== -1) {
        peerBlockHeader = Math.max(nodeInfo.synced_headers, peerBlockHeader);
      }
    });
  } catch (err) {
    getLogger().error(`peerHighestSyncedHeader getPeerInfo: ${err.message}`);
    return null;
  }

  return peerBlockHeader;
};

// Calculates the current sync percentage of the current block number
const calculateSyncPercent = async (blockNum, blockTime) => {
  const peerBlockHeader = await peerHighestSyncedHeader();
  if (_.isNull(peerBlockHeader)) {
    // estimate by blockTime
    let syncPercent = 100;
    const timestampNow = moment().unix();

    // if blockTime is 20 min behind, we are not fully synced
    if (blockTime < timestampNow - SYNC_THRESHOLD_SECS) {
      syncPercent = Math.floor(((blockTime - BLOCK_0_TIMESTAMP) / (timestampNow - BLOCK_0_TIMESTAMP)) * 100);
    }
    return syncPercent;
  }

  // Calculate accurate percentage
  return Math.floor((blockNum / peerBlockHeader) * 100);
};

// Send syncInfo subscription
const publishSyncInfo = async (blockNum, blockTime) => {
  const syncPercent = await calculateSyncPercent(blockNum, blockTime);
  const peerNodeCount = await Network.getPeerNodeCount();
  const balances = await addressBalances();
  pubsub.publish('onSyncInfo', {
    onSyncInfo: {
      blockNum,
      blockTime,
      syncPercent,
      peerNodeCount,
      addressBalances: balances,
    },
  });
};

module.exports = {
  publishSyncInfo,
  calculateSyncPercent,
};