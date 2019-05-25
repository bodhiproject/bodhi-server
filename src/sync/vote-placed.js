const { each } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const EventSig = require('../config/event-sig');
const parseBet = require('./parsers/bet');

const syncVotePlaced = async ({ startBlock, endBlock, syncPromises, limit }) => {
  try {
    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [EventSig.VotePlaced],
    });
    logger.info(`Found ${logs.length} VotePlaced`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(limit(async () => {
        try {
          // Parse and insert vote
          const bet = parseBet({ log });
          await DBHelper.insertBet(bet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(bet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);
        } catch (insertErr) {
          logger.error(`insert VotePlaced: ${insertErr.message}`);
          throw Error(`insert VotePlaced: ${insertErr.message}`);
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncVotePlaced:', err);
  }
};

const pendingVotePlaced = async ({ startBlock, syncPromises, limit }) => {
  try {
    // Find pending votes that have a block number less than the startBlock
    const pending = await DBHelper.findBet(
      {
        txStatus: TX_STATUS.PENDING,
        blockNum: { $lt: startBlock },
        eventRound: { $gte: 1 },
      },
      { blockNum: 1 },
    );
    if (pending.length === 0) return;
    logger.info(`Found ${pending.length} pending VotePlaced`);

    // Determine range to search logs
    let fromBlock;
    let toBlock;
    each(pending, (p) => {
      const pBlock = p.blockNum;
      if (!fromBlock || pBlock < fromBlock) fromBlock = pBlock;
      if (!toBlock || pBlock > toBlock) toBlock = pBlock;
    });

    await syncVotePlaced({
      startBlock: fromBlock,
      endBlock: toBlock,
      syncPromises,
      limit,
    });
  } catch (err) {
    throw Error('Error pendingVotePlaced:', err);
  }
};

module.exports = {
  syncVotePlaced,
  pendingVotePlaced,
};
