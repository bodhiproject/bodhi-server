const { isNull, each } = require('lodash');
const { web3 } = require('../web3');
const { getAbiObject } = require('../utils');
const { getLogger } = require('../utils/logger');
const Bet = require('../models/bet');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');

module.exports = async (txid) => {
  try {
    const naka = web3();

    const receipt = await web3.eth.getTransactionReceipt(txid);
    if (isNull(receipt)) throw Error(`txid ${txid} does not have tx receipt`);

    


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
        better,
        resultIndex,
        amount,
        eventRound,
      } = naka.eth.abi.decodeLog(obj.inputs, log.data, log.topics);

      const bet = new Bet({
        blockNum: log.blockNumber,
        txid: log.transactionHash,
        eventAddress,
        betterAddress: better,
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
          getLogger().error(`insert Bet: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncBetPlaced:', err);
  }
};
