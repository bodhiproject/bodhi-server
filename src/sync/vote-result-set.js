const { each } = require('lodash');
const web3 = require('../web3');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const logger = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const ResultSet = require('../models/result-set');

const parseLog = async ({ abiObj, log }) => {
  // TODO: uncomment when web3 decodeLog works. broken in 1.0.0-beta.54.
  // const {
  //   eventAddress,
  //   resultIndex,
  //   amount,
  //   eventRound,
  //   nextConsensusThreshold,
  //   nextArbitrationEndTime,
  // } = web3.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  const eventAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
  const decodedData = web3.eth.abi.decodeParameters(
    ['uint8', 'uint256', 'uint8', 'uint256', 'uint256'],
    log.data,
  );
  const resultIndex = decodedData['0'];
  const amount = decodedData['1'];
  const eventRound = decodedData['2'];
  const nextConsensusThreshold = decodedData['3'];
  const nextArbitrationEndTime = decodedData['4'];

  return new ResultSet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    centralizedOracleAddress: null,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
    nextConsensusThreshold: nextConsensusThreshold.toString(10),
    nextArbitrationEndTime: Number(nextArbitrationEndTime.toString(10)),
  });
};

module.exports = async ({ contractMetadata, startBlock, endBlock, syncPromises }) => {
  try {
    // Get event abi obj
    const abiObj = getAbiObject(
      contractMetadata.MultipleResultsEvent.abi,
      'VoteResultSet',
      'event',
    );
    if (!abiObj) throw Error('VoteResultSet event not found in ABI');

    // Fetch logs
    const logs = await web3.eth.getPastLogs({
      fromBlock: startBlock,
      toBlock: endBlock,
      topics: [web3.eth.abi.encodeEventSignature(abiObj)],
    });
    logger.info(`Found ${logs.length} VoteResultSet`);

    // Add to syncPromises array to be executed in parallel
    each(logs, (log) => {
      syncPromises.push(new Promise(async (resolve, reject) => {
        try {
          // Parse and insert result set
          const resultSet = await parseLog({ abiObj, log });
          await DBHelper.insertResultSet(resultSet);

          // Fetch and insert tx receipt
          const txReceipt = await getTransactionReceipt(resultSet.txid);
          await DBHelper.insertTransactionReceipt(txReceipt);

          resolve();
        } catch (insertErr) {
          logger.error(`insert VoteResultSet: ${insertErr.message}`);
          reject();
        }
      }));
    });
  } catch (err) {
    throw Error('Error syncVoteResultSet:', err);
  }
};
