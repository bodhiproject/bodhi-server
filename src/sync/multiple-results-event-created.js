const { each } = require('lodash');
const { web3 } = require('../web3');
const { getContractAddress } = require('../config');
const { getAbiObject } = require('../utils');

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
      const [sig, eventAddr, ownerAddr] = log.topics;
      const contract = new naka.eth.Contract(
        contractMetadata.MultipleResultsEvent.abi,
        eventAddr,
      );

      // Get event data
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

      // Insert/update
      promises.push(new Promise(async (resolve, reject) => {
        // TODO: need extra parsing before insertion/update?
        // if (await DBHelper.getCount(db.Topics, { txid }) > 0) {
        //   const foundTopic = await DBHelper.findOne(db.Topics, { txid }, ['language']);
        //   if (foundTopic.language) {
        //     topic.language = foundTopic.language;
        //   }
        //   DBHelper.updateTopicByQuery(db.Topics, { txid }, topic);
        // } else {
        //   DBHelper.insertTopic(db.Topics, topic);
        // }
      }));
    });

    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncMultipleResultsEventCreated:', err);
  }
};
