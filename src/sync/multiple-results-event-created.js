const { each, isNull } = require('lodash');
const insertTxReceipt = require('./tx-receipt');
const { web3 } = require('../web3');
const { getContractAddress } = require('../config');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { logger } = require('../utils/logger');
const MultipleResultsEvent = require('../models/multiple-results-event');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');

module.exports = async (contractMetadata, currentBlockNum) => {
  try {
    const naka = web3();

    // Get ABI object
    const obj = getAbiObject(
      contractMetadata.EventFactory.abi,
      'MultipleResultsEventCreated',
      'event',
    );
    if (!obj) throw Error('MultipleResultsEventCreated event not found in ABI');

    // Get all logs of event
    const eventSig = naka.eth.abi.encodeEventSignature(obj);
    const logs = await naka.eth.getPastLogs({
      fromBlock: currentBlockNum,
      toBlock: currentBlockNum,
      address: getContractAddress('EventFactory'),
      topics: [eventSig],
    });

    // Parse each log
    const promises = [];
    each(logs, async (log) => {
      const {
        eventAddr,
        ownerAddr,
      } = naka.eth.abi.decodeLog(obj.inputs, log.data, log.topics);

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

      const multipleResultsEvent = new MultipleResultsEvent({
        txid: log.transactionHash,
        txStatus: TX_STATUS.SUCCESS,
        blockNum: log.blockNumber,
        address: eventAddr,
        ownerAddress: ownerAddr,
        version,
        name: eventName,
        results: eventResults,
        numOfResults,
        centralizedOracle,
        betStartTime,
        betEndTime,
        resultSetStartTime,
        resultSetEndTime,
        escrowAmount,
        arbitrationLength,
        thresholdPercentIncrease,
        arbitrationRewardPercentage,
        consensusThreshold,
        arbitrationEndTime,
      });

      // Insert/update
      promises.push(new Promise(async (resolve, reject) => {
        try {
          const existingEvent =
            await DBHelper.findOneEvent(db, { txid: multipleResultsEvent.txid });
          if (isNull(existingEvent)) {
            // Existing event not found
            await DBHelper.insertEvent(db, multipleResultsEvent);
          } else {
            // Existing event found
            multipleResultsEvent.language = existingEvent.language;
            await DBHelper.updateEvent(db, multipleResultsEvent);
          }

          // Fetch/insert tx receipt
          await insertTxReceipt(multipleResultsEvent.txid);

          resolve();
        } catch (insertErr) {
          logger().error(`insert MultipleResultsEvent: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncMultipleResultsEventCreated:', err);
  }
};
