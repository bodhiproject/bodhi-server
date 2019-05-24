const { each, isNull } = require('lodash');
const { web3 } = require('../web3');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { logger } = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const ResultSet = require('../models/result-set');

const getAbiObj = (contractMetadata) => {
  const abiObj = getAbiObject(
    contractMetadata.MultipleResultsEvent.abi,
    'ResultSet',
    'event',
  );
  if (!abiObj) throw Error('ResultSet event not found in ABI');
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

  const pending = await DBHelper.findResultSet({
    txStatus: TX_STATUS.PENDING,
    eventRound: 0,
  });
  each(pending, async (pendingResultSet) => {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const txReceipt = await getTransactionReceipt(pendingResultSet.txid);
        if (!isNull(txReceipt)) {
          if (!blockNums.includes(txReceipt.blockNum)) {
            blockNums.push(txReceipt.blockNum);
          }
          txReceipts[pendingResultSet.txid] = txReceipt;
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
    topics: [eventSig],
  });
};

const parseLog = async ({ naka, abiObj, log }) => {
  // TODO: uncomment when web3 decodeLog works. broken in 1.0.0-beta.54.
  // const {
  //   eventAddress,
  //   centralizedOracle,
  //   resultIndex,
  //   amount,
  //   eventRound,
  //   nextConsensusThreshold,
  //   nextArbitrationEndTime,
  // } = naka.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  const eventAddress = naka.eth.abi.decodeParameter('address', log.topics[1]);
  const centralizedOracleAddress = naka.eth.abi.decodeParameter('address', log.topics[2]);
  const decodedData = naka.eth.abi.decodeParameters(
    ['uint8', 'uint256', 'uint8', 'uint256', 'uint256'],
    log.data,
  );
  const resultIndex = decodedData['0'];
  const amount = decodedData['1'];
  const eventRound = decodedData['2'];
  const nextConsensusThreshold = decodedData['3'].toString(10);
  const nextArbitrationEndTime = decodedData['4'].toString(10);

  const resultSet = new ResultSet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    centralizedOracleAddress,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
  });

  return {
    resultSet,
    nextConsensusThreshold,
    nextArbitrationEndTime: Number(nextArbitrationEndTime),
  };
};

const updateEventRound = async ({
  resultSet,
  nextConsensusThreshold,
  nextArbitrationEndTime,
}) => {
  const event = await DBHelper.findOneEvent({ address: resultSet.eventAddress });
  event.currentRound = resultSet.eventRound + 1;
  event.currentResultIndex = resultSet.resultIndex;
  event.consensusThreshold = nextConsensusThreshold;
  event.arbitrationEndTime = nextArbitrationEndTime;
  await DBHelper.updateEvent(event);
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
          // Parse each result set and insert
          const logs = await getLogs({ naka, abiObj, blockNum });
          each(logs, async (log) => {
            const {
              resultSet,
              nextConsensusThreshold,
              nextArbitrationEndTime,
            } = await parseLog({ naka, abiObj, log });
            await DBHelper.insertResultSet(resultSet);

            // Update event round info
            await updateEventRound({
              resultSet,
              nextConsensusThreshold,
              nextArbitrationEndTime,
            });

            // Update tx receipt
            let txReceipt = txReceipts[resultSet.txid];
            if (!txReceipt) txReceipt = await getTransactionReceipt(resultSet.txid);
            await DBHelper.insertTransactionReceipt(txReceipt);
          });

          resolve();
        } catch (insertErr) {
          logger().error(`insert ResultSet: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });
    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncResultSet:', err);
  }
};
