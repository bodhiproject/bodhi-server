const { each } = require('lodash');
const { web3 } = require('../web3');
const { getAbiObject } = require('../utils');
const { getLogger } = require('../utils/logger');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');
const ResultSet = require('../models/result-set');

module.exports = async (contractMetadata, currentBlockNum) => {
  try {
    const naka = web3();

    // Get ABI object
    const obj = getAbiObject(
      contractMetadata.MultipleResultsEvent.abi,
      'VoteResultSet',
      'event',
    );
    if (!obj) throw Error('VoteResultSet event not found in ABI');

    // Get all logs of event
    const eventSig = naka.eth.abi.encodeEventSignature(obj);
    const logs = await naka.eth.getPastLogs({
      fromBlock: currentBlockNum,
      toBlock: currentBlockNum,
      topics: [eventSig],
    });

    // Parse each log
    const promises = [];
    each(logs, async (log) => {
      const {
        eventAddress,
        resultIndex,
        amount,
        eventRound,
        nextConsensusThreshold,
        nextArbitrationEndTime,
      } = naka.eth.abi.decodeLog(obj.inputs, log.data, log.topics);

      const resultSet = new ResultSet({
        blockNum: log.blockNumber,
        txid: log.transactionHash,
        eventAddress,
        centralizedOracle: null,
        resultIndex,
        amount,
        eventRound,
      });

      // Insert/update
      promises.push(new Promise(async (resolve, reject) => {
        try {
          // Insert new ResultSet
          await DBHelper.insertResultSet(db, resultSet);

          // Update round info for Event
          const event = await DBHelper.findOneEvent(db, eventAddress);
          event.consensusThreshold = nextConsensusThreshold;
          event.arbitrationEndTime = nextArbitrationEndTime;
          await DBHelper.updateEvent(db, event);

          resolve();
        } catch (insertErr) {
          getLogger().error(`insert VoteResultSet: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncVoteResultSet:', err);
  }
};
