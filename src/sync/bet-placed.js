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

module.exports = async (contractMetadata) => {
  try {
    const abiObj = getAbiObj(contractMetadata);
    const naka = web3();
    const promises = [];

    // Loop pending bets and see if confirmed
    const pending = await DBHelper.findBet(db, { txStatus: TX_STATUS.PENDING });
    each(pending, async (pendingBet) => {
      const txReceipt = await getTransactionReceipt(pendingBet.txid);

      // Only confirm bet if tx is confirmed
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

            // Parse each log
            each(logs, async (log) => {
              const bet = await parseLog({
                naka,
                abiObj,
                log,
              });
              await DBHelper.insertBet(db, bet);
            });

            resolve();
          } catch (insertErr) {
            logger().error(`insert Bet: ${insertErr.message}`);
            reject(insertErr);
          }
        }));
      }
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};
