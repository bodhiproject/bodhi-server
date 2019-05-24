const { each, isNull } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { logger } = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const Bet = require('../models/bet');
const DBHelper = require('../db/db-helper');

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

  const pending = await DBHelper.findBet({
    txStatus: TX_STATUS.PENDING,
    eventRound: 0,
  });
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
        logger().error(`getBlocksAndReceipts: ${err.message}`);
        reject();
      }
    }));
  });
  await Promise.all(promises);

  return { blockNums, txReceipts };
};

const parseLog = async ({ abiObj, log }) => {
  // TODO: uncomment when web3 decodeLog works. broken in 1.0.0-beta.54.
  // const {
  //   eventAddress,
  //   better,
  //   resultIndex,
  //   amount,
  //   eventRound,
  // } = web3.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  const eventAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
  const betterAddress = web3.eth.abi.decodeParameter('address', log.topics[2]);
  const decodedData = web3.eth.abi.decodeParameters(
    ['uint8', 'uint256', 'uint8'],
    log.data,
  );
  const resultIndex = decodedData['0'];
  const amount = decodedData['1'];
  const eventRound = decodedData['2'];

  return new Bet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    betterAddress,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
  });
};

module.exports = async ({ contractMetadata, startBlock, endBlock, syncPromises }) => {
  try {
    // Get event abi obj
    const abiObj = getAbiObject(
      contractMetadata.MultipleResultsEvent.abi,
      'BetPlaced',
      'event',
    );
    if (!abiObj) throw Error('BetPlaced event not found in ABI');

    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [web3.eth.abi.encodeEventSignature(abiObj)],
    });
    logger().info(`Found ${logs.length} BetPlaced`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(new Promise(async (resolve, reject) => {
        try {
          // Parse and insert bet
          const bet = await parseLog({ abiObj, log });
          await DBHelper.insertBet(bet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(bet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);

          resolve();
        } catch (insertErr) {
          logger().error(`insert BetPlaced: ${insertErr.message}`);
          reject();
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};
