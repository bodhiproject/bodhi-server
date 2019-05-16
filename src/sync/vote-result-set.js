const { each } = require('lodash');
const { web3 } = require('../web3');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { logger } = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');
const ResultSet = require('../models/result-set');

const getAbiObj = (contractMetadata) => {
  const abiObj = getAbiObject(
    contractMetadata.MultipleResultsEvent.abi,
    'VoteResultSet',
    'event',
  );
  if (!abiObj) throw Error('VoteResultSet event not found in ABI');
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
    resultIndex,
    amount,
    eventRound,
    nextConsensusThreshold,
    nextArbitrationEndTime,
  } = naka.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  const resultSet = new ResultSet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    centralizedOracleAddress: null,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
  });

  return {
    resultSet,
    nextConsensusThreshold,
    nextArbitrationEndTime,
  };
};

const updateEventRound = async ({
  resultSet,
  nextConsensusThreshold,
  nextArbitrationEndTime,
}) => {
  const event = await DBHelper.findOneEvent(
    db,
    { eventAddress: resultSet.eventAddress },
  );
  event.currentRound = resultSet.eventRound + 1;
  event.currentResultIndex = resultSet.resultIndex;
  event.consensusThreshold = nextConsensusThreshold;
  event.arbitrationEndTime = nextArbitrationEndTime;
  await DBHelper.updateEvent(db, event);
};

module.exports = async (contractMetadata, currBlockNum) => {
  try {
    const naka = web3();
    const abiObj = getAbiObj(contractMetadata);
    const blockNums = [currBlockNum];

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
            await DBHelper.insertResultSet(db, resultSet);

            // Update event round info
            await updateEventRound({
              resultSet,
              nextConsensusThreshold,
              nextArbitrationEndTime,
            });

            // Update tx receipt
            const txReceipt = await getTransactionReceipt(resultSet.txid);
            await DBHelper.insertTransactionReceipt(db, txReceipt);
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
    throw Error('Error syncVoteResultSet:', err);
  }
};
