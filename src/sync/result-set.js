const { each } = require('lodash');
const { web3 } = require('../web3');
const { getAbiObject } = require('../utils');
const { getLogger } = require('../utils/logger');

module.exports = async (contractMetadata, currentBlockNum) => {
  try {
    const naka = web3();

    // Get ABI object
    const obj = getAbiObject(
      contractMetadata.MultipleResultsEvent.abi,
      'ResultSet',
      'event',
    );
    if (!obj) throw Error('ResultSet event not found in ABI');

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
        centralizedOracle,
        resultIndex,
        amount,
        eventRound,
        nextConsensusThreshold,
        nextArbitrationEndTime,
      } = naka.eth.abi.decodeLog(obj.inputs, log.data, log.topics);

      // Insert/update
      promises.push(new Promise(async (resolve, reject) => {
        try {

          resolve();
        } catch (insertErr) {
          getLogger().error(`insert ResultSet: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncResultSet:', err);
  }
};
