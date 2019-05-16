const { each, isNull } = require('lodash');
const { web3 } = require('../web3');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { logger } = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const Bet = require('../models/bet');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');

const getAbiObj = (contractMetadata) => {
  const abiObj = getAbiObject(
    contractMetadata.MultipleResultsEvent.abi,
    'BetPlaced',
    'event',
  );
  if (!abiObj) throw Error('BetPlaced event not found in ABI');
  return abiObj;
};

/**
 * Gets the block numbers needed to parse logs for.
 * Also returns tx receipts for confirmed pending items.
 * @param {number} currBlockNum Current block number
 * @return {object} Block numbers and tx receipts
 */
const getBlocksAndReceipts = async (currBlockNum) => {
  const blockNums = [currBlockNum];
  const txReceipts = {};
  const promises = [];

  const pending = await DBHelper.findBet(db, { txStatus: TX_STATUS.PENDING });
  each(pending, async (pendingBet) => {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const txReceipt = await getTransactionReceipt(pendingBet.txid);
        if (!isNull(txReceipt)) {
          if (!blockNums.includes(txReceipt.blockNum)) {
            blockNums.push(txReceipt.blockNum);
          }
          txReceipts[pendingBet.txid] = txReceipt;
        }
        resolve();
      } catch (err) {
        logger().error(`getBlocksAndReceipts Bet: ${err.message}`);
        reject();
      }
    }));
  });
  await Promise.all(promises);

  return { blockNums, txReceipts };
};

const getLogs = async ({ naka, abiObj, blockNum }) => {
  const eventSig = naka.eth.abi.encodeEventSignature(abiObj);
  return naka.eth.getPastLogs({
    fromBlock: blockNum,
    toBlock: blockNum,
    topics: [eventSig],
  });
};

const parseLog = async ({ naka, abiObj, log }) => {
  const {
    eventAddress,
    better,
    resultIndex,
    amount,
    eventRound,
  } = naka.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  return new Bet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    betterAddress: better,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
  });
};

module.exports = async (contractMetadata, currBlockNum) => {
  try {
    const naka = web3();
    const abiObj = getAbiObj(contractMetadata);
    const { blockNums, txReceipts } = await getBlocksAndReceipts(currBlockNum);

    const promises = [];
    each(blockNums, (blockNum) => {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          // Parse each bet and insert
          const logs = await getLogs({ naka, abiObj, blockNum });
          each(logs, async (log) => {
            const bet = await parseLog({ naka, abiObj, log });
            await DBHelper.insertBet(db, bet);

            // Update tx receipt
            let txReceipt = txReceipts[bet.txid];
            if (!txReceipt) txReceipt = await getTransactionReceipt(bet.txid);
            await DBHelper.insertTransactionReceipt(db, txReceipt);
          });

          resolve();
        } catch (insertErr) {
          logger().error(`insert Bet: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });
    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};
