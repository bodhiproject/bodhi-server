const { each } = require('lodash');
const { web3 } = require('../web3');
const { getAbiObject } = require('../utils');
const { getLogger } = require('../utils/logger');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');
const Bet = require('../models/bet');

module.exports = async (contractMetadata, currentBlockNum) => {
  try {
    const naka = web3();

    // Get ABI object
    const obj = getAbiObject(
      contractMetadata.MultipleResultsEvent.abi,
      'VotePlaced',
      'event',
    );
    if (!obj) throw Error('VotePlaced event not found in ABI');

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
        voter,
        resultIndex,
        amount,
        eventRound,
      } = naka.eth.abi.decodeLog(obj.inputs, log.data, log.topics);

      const bet = new Bet({
        blockNum: log.blockNumber,
        txid: log.transactionHash,
        eventAddress,
        betterAddress: voter,
        resultIndex,
        amount,
        eventRound,
      });

      // Insert/update
      promises.push(new Promise(async (resolve, reject) => {
        try {
          await DBHelper.insertBet(db, bet);
          resolve();
        } catch (insertErr) {
          getLogger().error(`insert Vote: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncVotePlaced:', err);
  }
};
