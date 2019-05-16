const { each, isNull } = require('lodash');
const { web3 } = require('../web3');
const { getContractAddress } = require('../config');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { getTransactionReceipt } = require('../utils/web3-utils');
const { logger } = require('../utils/logger');
const MultipleResultsEvent = require('../models/multiple-results-event');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');

const getAbiObj = (contractMetadata) => {
  const abiObj = getAbiObject(
    contractMetadata.EventFactory.abi,
    'MultipleResultsEventCreated',
    'event',
  );
  if (!abiObj) throw Error('MultipleResultsEventCreated event not found in ABI');
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

  const pending = await DBHelper.findEvent(db, { txStatus: TX_STATUS.PENDING });
  each(pending, async (pendingEvent) => {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const txReceipt = await getTransactionReceipt(pendingEvent.txid);
        if (!isNull(txReceipt)) {
          if (!blockNums.includes(txReceipt.blockNum)) {
            blockNums.push(txReceipt.blockNum);
          }
          txReceipts[pendingEvent.txid] = txReceipt;
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

const getLogs = async ({ naka, abiObj, blockNum }) => {
  const eventSig = naka.eth.abi.encodeEventSignature(abiObj);
  return naka.eth.getPastLogs({
    fromBlock: blockNum,
    toBlock: blockNum,
    address: getContractAddress('EventFactory'),
    topics: [eventSig],
  });
};

const parseLog = async ({ naka, abiObj, contractMetadata, log }) => {
  const {
    eventAddr,
    ownerAddr,
  } = naka.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  // Get event data
  const contract = new naka.eth.Contract(
    contractMetadata.MultipleResultsEvent.abi,
    eventAddr,
  );
  const [
    version,
    eventName,
    eventResults,
    numOfResults,
  ] = await contract.methods.eventMetadata().call();
  const [
    centralizedOracle,
    betStartTime,
    betEndTime,
    resultSetStartTime,
    resultSetEndTime,
  ] = await contract.methods.centralizedMetadata().call();
  const [
    escrowAmount,
    arbitrationLength,
    thresholdPercentIncrease,
    arbitrationRewardPercentage,
  ] = await contract.methods.configMetadata().call();
  const consensusThreshold =
    await contract.methods.currentConsensusThreshold().call();
  const arbitrationEndTime =
    await contract.methods.currentArbitrationEndTime().call();

  return new MultipleResultsEvent({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    address: eventAddr,
    ownerAddress: ownerAddr,
    version: Number(version),
    name: eventName,
    results: eventResults,
    numOfResults: Number(numOfResults),
    centralizedOracle,
    betStartTime: betStartTime.toString(10),
    betEndTime: betEndTime.toString(10),
    resultSetStartTime: resultSetStartTime.toString(10),
    resultSetEndTime: resultSetEndTime.toString(10),
    escrowAmount: escrowAmount.toString(10),
    arbitrationLength: arbitrationLength.toString(10),
    thresholdPercentIncrease: thresholdPercentIncrease.toString(10),
    arbitrationRewardPercentage: arbitrationRewardPercentage.toString(10),
    consensusThreshold: consensusThreshold.toString(10),
    arbitrationEndTime: arbitrationEndTime.toString(10),
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
          // Parse each event and insert
          const logs = await getLogs({ naka, abiObj, blockNum });
          each(logs, async (log) => {
            const event = await parseLog({ naka, abiObj, contractMetadata, log });
            await DBHelper.insertEvent(db, event);

            // Update tx receipt
            let txReceipt = txReceipts[event.txid];
            if (!txReceipt) txReceipt = await getTransactionReceipt(event.txid);
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
    throw Error('Error syncMultipleResultsEventCreated:', err);
  }
};
