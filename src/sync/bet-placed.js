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

// Process pending bets using block numbers in tx receipts
const processPending = async ({ naka, abiObj }) => {
  const promises = [];

  // Loop pending bets
  const pending = await DBHelper.findBet(db, { txStatus: TX_STATUS.PENDING });
  each(pending, async (pendingBet) => {
    const txReceipt = await getTransactionReceipt(pendingBet.txid);

    // Confirm bet if tx is confirmed
    if (!isNull(txReceipt)) {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          // Update tx receipt
          await DBHelper.insertTransactionReceipt(db, txReceipt);

          // Get logs
          const logs = await getLogs({
            naka,
            abiObj,
            blockNum: txReceipt.blockNum,
          });

          // Parse each log and insert
          each(logs, async (log) => {
            const bet = await parseLog({ naka, abiObj, log });
            await DBHelper.insertBet(db, bet);
          });

          resolve();
        } catch (insertErr) {
          logger().error(`process pending Bet: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    }
  });

  await Promise.all(promises);
};

// Process confirmed bets for the current block
const processBlock = async ({ naka, abiObj, currBlockNum }) => {
  const promises = [];

  // Get logs
  const logs = await getLogs({ naka, abiObj, blockNum: currBlockNum });

  // Parse each log and insert
  each(logs, async (log) => {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const bet = await parseLog({ naka, abiObj, log });
        await DBHelper.insertBet(db, bet);
        resolve();
      } catch (insertErr) {
        logger().error(`process block Bet: ${insertErr.message}`);
        reject(insertErr);
      }
    }));
  });

  await Promise.all(promises);
};

module.exports = async (contractMetadata, currBlockNum) => {
  try {
    const naka = web3();
    const abiObj = getAbiObj(contractMetadata);
    await processPending({ naka, abiObj });
    await processBlock({ naka, abiObj, currBlockNum });
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};
