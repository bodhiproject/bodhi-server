const { BigNumber } = require('bignumber.js');

const { getContractMetadata, isMainnet } = require('../config');
const { db, DBHelper } = require('../db/nedb');
const { getLogger } = require('../utils/logger');

const removeHexPrefix = true;
let contractMetadata;

// Returns the starting block to start syncing
const getStartBlock = async () => {
  let startBlock = contractMetadata.contractDeployedBlock;
  if (!startBlock) {
    throw Error('Missing startBlock in contract metadata.');
  }

  const blocks = await db.Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
  if (blocks.length > 0) {
    startBlock = Math.max(blocks[0].blockNum + 1, startBlock);
  }

  return startBlock;
};

const syncTopicCreated = async (currentBlockNum) => {
  let result;
  try {
    result = await getInstance().searchLogs(currentBlockNum, currentBlockNum, contractMetadata.EventFactory.address,
      [contractMetadata.EventFactory.TopicCreated], contractMetadata, removeHexPrefix);
    getLogger().debug(`${result.length} TopicCreated entries`);
  } catch (err) {
    throw Error(`searchlog TopicCreated: ${err.message}`);
  }

  const topicEventPromises = [];
  _.forEach(result, (event, index) => {
    const blockNum = event.blockNumber;
    const txid = event.transactionHash;

    _.forEachRight(event.log, (entry) => {
      if (entry._eventName === 'TopicCreated') {
        topicEventPromises.push(new Promise(async (resolve) => {
          try {
            const topic = new Topic(blockNum, txid, entry).translate();

            // Update existing mutated Topic or insert new
            if (await DBHelper.getCount(db.Topics, { txid }) > 0) {
              DBHelper.updateTopicByQuery(db.Topics, { txid }, topic);
            } else {
              DBHelper.insertTopic(db.Topics, topic);
            }

            resolve();
          } catch (err) {
            getLogger().error(`insert TopicEvent: ${err.message}`);
            resolve();
          }
        }));
      }
    });
  });

  await Promise.all(topicEventPromises);
};

const syncCentralizedOracleCreated = async (currentBlockNum) => {
  let result;
  try {
    result = await getInstance().searchLogs(currentBlockNum, currentBlockNum, contractMetadata.EventFactory.address,
      [contractMetadata.OracleFactory.CentralizedOracleCreated], contractMetadata, removeHexPrefix);
    getLogger().debug(`${result.length} CentralizedOracleCreated entries`);
  } catch (err) {
    throw Error(`searchlog CentralizedOracleCreated: ${err.message}`);
  }
  
  const cOraclePromises = [];
  _.forEach(result, (event, index) => {
    const blockNum = event.blockNumber;
    const txid = event.transactionHash;

    _.forEachRight(event.log, (rawLog) => {
      if (rawLog._eventName === 'CentralizedOracleCreated') {
        cOraclePromises.push(new Promise(async (resolve) => {
          try {
            const cOracle = new CentralizedOracle(blockNum, txid, rawLog).translate();

            // Insert existing Topic info into Oracle
            const topic = await DBHelper.findOne(db.Topics, { address: cOracle.topicAddress }, ['name', 'options']);
            cOracle.name = topic.name;
            cOracle.options = topic.options;

            // Update existing mutated Oracle or insert new
            if (await DBHelper.getCount(db.Oracles, { txid }) > 0) {
              DBHelper.updateOracleByQuery(db.Oracles, { txid }, cOracle);
            } else {
              DBHelper.insertOracle(db.Oracles, cOracle);
            }

            resolve();
          } catch (err) {
            getLogger().error(`insert CentralizedOracle: ${err.message}`);
            resolve();
          }
        }));
      }
    });
  });

  await Promise.all(cOraclePromises);
};

const syncDecentralizedOracleCreated = async (currentBlockNum, currentBlockTime) => {
  let result;
  try {
    result = await getInstance().searchLogs(currentBlockNum, currentBlockNum, [], 
      contractMetadata.OracleFactory.DecentralizedOracleCreated, contractMetadata, removeHexPrefix);
    getLogger().debug(`${result.length} DecentralizedOracleCreated entries`);
  } catch (err) {
    throw Error(`searchlog DecentralizedOracleCreated: ${err.message}`);
  }
  
  const dOraclePromises = [];
  _.forEach(result, (event, index) => {
    const blockNum = event.blockNumber;
    const txid = event.transactionHash;

    _.forEachRight(event.log, (rawLog) => {
      if (rawLog._eventName === 'DecentralizedOracleCreated') {
        dOraclePromises.push(new Promise(async (resolve) => {
          try {
            const dOracle = new DecentralizedOracle(blockNum, txid, rawLog).translate();

            const topic = await DBHelper.findOne(db.Topics, { address: dOracle.topicAddress }, ['name', 'options']);
            dOracle.name = topic.name;
            dOracle.options = topic.options;
            dOracle.startTime = currentBlockTime;

            await db.Oracles.insert(dOracle);
            resolve();
          } catch (err) {
            getLogger().error(`insert DecentralizedOracleCreated: ${err.message}`);
            resolve();
          }
        }));
      }
    });
  });

  await Promise.all(dOraclePromises);
}

const syncOracleResultVoted = (currentBlockNum) => {
  let result;
  try {
    result = await getInstance().searchLogs(currentBlockNum, currentBlockNum, [], 
      contractMetadata.CentralizedOracle.OracleResultVoted, contractMetadata, removeHexPrefix);
    getLogger().debug(`${result.length} OracleResultVoted entries`);
  } catch (err) {
    throw Error(`searchlog OracleResultVoted: ${err.message}`);
  }
  
  const votedPromises = [];
  _.forEach(result, (event, index) => {
    const blockNum = event.blockNumber;
    const txid = event.transactionHash;

    _.forEachRight(event.log, (rawLog) => {
      if (rawLog._eventName === 'OracleResultVoted') {
        votedPromises.push(new Promise(async (resolve) => {
          try {
            const vote = new Vote(blockNum, txid, rawLog).translate();

            // Add Topic address to Vote
            const oracle = await DBHelper.findOne(db.Oracles, { address: vote.oracleAddress }, ['topicAddress']);
            vote.topicAddress = oracle.topicAddress;
            await db.Votes.insert(vote);

            // Update Topic balance
            const voteBn = new BigNumber(vote.amount);
            const topic = await DBHelper.findOne(db.Topics, { address: oracle.topicAddress });
            switch (vote.token) {
              case 'QTUM': {
                topic.qtumAmount[vote.optionIdx] = new BigNumber(topic.qtumAmount[vote.optionIdx]).plus(voteBn).toString(10);
                await DBHelper.updateObjectByQuery(db.Topics, { address: topic.address }, { qtumAmount: topic.qtumAmount });
                break;
              }
              case 'BOT': {
                topic.botAmount[vote.optionIdx] = new BigNumber(topic.botAmount[vote.optionIdx]).plus(voteBn).toString(10);
                await DBHelper.updateObjectByQuery(db.Topics, { address: topic.address }, { botAmount: topic.botAmount });
                break;
              }
              default: {
                throw Error(`Invalid token type: ${vote.token}`);
              }
            }

            // Update Oracle balance
            oracle.amounts[vote.optionIdx] = new BigNumber(oracle.amounts[vote.optionIdx]).plus(voteBn).toString(10);
            await DBHelper.updateObjectByQuery(db.Oracles, { address: oracle.address }, { amounts: oracle.amounts });
            
            resolve();
          } catch (err) {
            getLogger().error(`insert OracleResultVoted: ${err.message}`);
            resolve();
          }
        }));
      }
    });
  });

  await Promise.all(votedPromises);
};

const sync = async (blockNum) => {
  contractMetadata = getContractMetadata();
  const currentBlockHash = await getInstance().getBlockHash(blockNum);
  const currentBlockTime = (await getInstance().getBlock(currentBlockHash)).time;

  getLogger().debug(`Syncing block ${blockNum}`);
  await syncTopicCreated(blockNum);
  await syncCentralizedOracleCreated(blockNum);
  await syncDecentralizedOracleCreated(blockNum, currentBlockTime);
  await syncOracleResultVoted(blockNum);
};
