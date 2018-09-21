const { includes, fill } = require('lodash');
const moment = require('moment');
const crypto = require('crypto');

const { TX_STATE, TX_TYPE, TOKEN } = require('../constants');
const { Config, getContractMetadata } = require('../config');
const DBHelper = require('../db/db-helper');
const { isAllowanceEnough, getVotingGasLimit } = require('../utils');
const { getLogger } = require('../utils/logger');
const Blockchain = require('../api/blockchain');
const BodhiToken = require('../api/bodhi-token');
const EventFactory = require('../api/event-factory');
const TopicEvent = require('../api/topic-event');
const CentralizedOracle = require('../api/centralized-oracle');
const DecentralizedOracle = require('../api/decentralized-oracle');
const Wallet = require('../api/wallet');
const Transaction = require('../models/transaction');

const getBlockNum = async () => {
  try {
    return await Blockchain.getBlockCount();
  } catch (err) {
    getLogger().error(`getBlockNum error: ${err.message}`);
    throw err;
  }
};

const needsToExecuteTx = ({ txid, gasLimit, gasPrice }) => !txid && !gasLimit && !gasPrice;

const insertPendingTx = async (db, data) => {
  const tx = new Transaction(Object.assign(data, {
    status: TX_STATE.PENDING,
    createdBlock: await getBlockNum(),
    createdTime: moment().unix(),
  }));
  await DBHelper.insertTransaction(db, tx);
  return tx;
};

module.exports = {
  createTopic: async (root, data, { db: { Topics, Oracles, Transactions } }) => {
    const {
      name,
      options,
      resultSetterAddress,
      bettingStartTime,
      bettingEndTime,
      resultSettingStartTime,
      resultSettingEndTime,
      amount,
      senderAddress,
    } = data;
    const addressManagerAddr = getContractMetadata().AddressManager.address;

    // Check for existing CreateEvent transactions
    if (await DBHelper.isPreviousCreateEventPending(Transactions, senderAddress)) {
      getLogger().error('Pending CreateEvent transaction found.');
      throw Error('Pending CreateEvent transaction found');
    }

    // Check the allowance first
    let type;
    let sentTx;
    if (await isAllowanceEnough(senderAddress, addressManagerAddr, amount)) {
      // Send createTopic tx
      type = TX_TYPE.CREATEEVENT;
      try {
        sentTx = await EventFactory.createTopic({
          oracleAddress: resultSetterAddress,
          eventName: name,
          resultNames: options,
          bettingStartTime,
          bettingEndTime,
          resultSettingStartTime,
          resultSettingEndTime,
          senderAddress,
        });
      } catch (err) {
        getLogger().error(`Error calling EventFactory.createTopic: ${err.message}`);
        throw err;
      }
    } else {
      // Send approve first since allowance is not enough
      type = TX_TYPE.APPROVECREATEEVENT;
      try {
        sentTx = await BodhiToken.approve({
          spender: addressManagerAddr,
          value: amount,
          senderAddress,
        });
      } catch (err) {
        getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
        throw err;
      }
    }
    const version = Config.CONTRACT_VERSION_NUM;
    const createdTime = moment().unix();
    const hashId = crypto.createHash('md5').update(`${createdTime}${name}`).digest('hex');

    // Insert Transaction
    const tx = new Transaction({
      type,
      txid: sentTx.txid,
      status: TX_STATE.PENDING,
      createdBlock: await getBlockNum(),
      createdTime,
      gasLimit: sentTx.args.gasLimit.toString(10),
      gasPrice: sentTx.args.gasPrice.toFixed(8),
      senderAddress,
      version,
      name,
      options,
      resultSetterAddress,
      bettingStartTime,
      bettingEndTime,
      resultSettingStartTime,
      resultSettingEndTime,
      amount,
      token: TOKEN.BOT,
    });
    await DBHelper.insertTransaction(Transactions, tx);

    // Insert Topic
    const topic = {
      txid: sentTx.txid,
      status: 'CREATED',
      version,
      escrowAmount: amount,
      name,
      options,
      qtumAmount: fill(Array(options), '0'),
      botAmount: fill(Array(options), '0'),
      creatorAddress: senderAddress,
      hashId,
    };
    getLogger().debug(`Mutation Insert: Topic txid:${topic.txid}`);
    await DBHelper.insertTopic(Topics, topic);

    // Insert Oracle
    const oracle = {
      txid: sentTx.txid,
      status: 'CREATED',
      version,
      resultSetterAddress,
      token: TOKEN.QTUM,
      name,
      options,
      optionIdxs: Array.from(Array(options).keys()),
      amounts: fill(Array(options), '0'),
      startTime: bettingStartTime,
      endTime: bettingEndTime,
      resultSetStartTime: resultSettingStartTime,
      resultSetEndTime: resultSettingEndTime,
      hashId,
    };
    getLogger().debug(`Mutation Insert: Oracle txid:${oracle.txid}`);
    await DBHelper.insertOracle(Oracles, oracle);

    return tx;
  },

  createBet: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.BET, token: TOKEN.QTUM, version: 0 });

    // Send bet tx if not already sent
    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await CentralizedOracle.bet({
          contractAddress: tx.oracleAddress,
          index: tx.optionIdx,
          amount: tx.amount,
          senderAddress: tx.senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling CentralizedOracle.bet: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  approveSetResult: async (root, data, { db: { Transactions } }) => {
    const tx = Object.assign({}, data, { type: TX_TYPE.APPROVESETRESULT, token: TOKEN.BOT, version: 0 });
    return insertPendingTx(Transactions, tx);
  },

  setResult: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.SETRESULT, token: TOKEN.BOT, version: 0 });
    const { senderAddress, topicAddress, amount } = tx;

    if (await isAllowanceEnough(senderAddress, topicAddress, amount)) {
      tx.type = TX_TYPE.SETRESULT;
    } else {
      tx.type = TX_TYPE.APPROVESETRESULT;
    }

    if (needsToExecuteTx(tx)) {
      if (await isAllowanceEnough(senderAddress, topicAddress, amount)) {
        // Send setResult since the allowance is enough
        try {
          const { txid, args: { gasLimit, gasPrice } } = await CentralizedOracle.setResult({
            contractAddress: tx.oracleAddress,
            resultIndex: tx.optionIdx,
            senderAddress,
          });
          tx = Object.assign(tx, { txid, gasLimit, gasPrice });
        } catch (err) {
          getLogger().error(`Error calling CentralizedOracle.setResult: ${err.message}`);
          throw err;
        }
      } else {
        // Send approve first since allowance is not enough
        try {
          const { txid, args: { gasLimit, gasPrice } } = await BodhiToken.approve({
            spender: topicAddress,
            value: amount,
            senderAddress,
          });
          tx = Object.assign(tx, { txid, gasLimit, gasPrice });
        } catch (err) {
          getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
          throw err;
        }
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  approveVote: async (root, data, { db: { Transactions } }) => {
    const tx = Object.assign({}, data, { type: TX_TYPE.APPROVEVOTE, token: TOKEN.BOT, version: 0 });
    return insertPendingTx(Transactions, tx);
  },

  createVote: async (root, data, { db: { Oracles, Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.VOTE, token: TOKEN.BOT, version: 0 });
    const { senderAddress, topicAddress, oracleAddress, optionIdx, amount } = tx;

    if (await isAllowanceEnough(senderAddress, topicAddress, amount)) {
      tx.type = TX_TYPE.VOTE;
    } else {
      tx.type = TX_TYPE.APPROVEVOTE;
    }

    if (needsToExecuteTx(tx)) {
      if (await isAllowanceEnough(senderAddress, topicAddress, amount)) {
        // Send vote since allowance is enough
        try {
          // Find if voting over threshold to set correct gas limit
          const voteGasLimit = await getVotingGasLimit(Oracles, oracleAddress, optionIdx, amount);

          const { txid, args: { gasLimit, gasPrice } } = await DecentralizedOracle.vote({
            contractAddress: oracleAddress,
            resultIndex: optionIdx,
            botAmount: amount,
            senderAddress,
            gasLimit: voteGasLimit,
          });
          tx = Object.assign(tx, { txid, gasLimit, gasPrice });
        } catch (err) {
          getLogger().error(`Error calling DecentralizedOracle.vote: ${err.message}`);
          throw err;
        }
      } else {
        // Send approve first because allowance is not enough
        try {
          const { txid, args: { gasLimit, gasPrice } } = await BodhiToken.approve({
            spender: topicAddress,
            value: amount,
            senderAddress,
          });
          tx = Object.assign(tx, { txid, gasLimit, gasPrice });
        } catch (err) {
          getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
          throw err;
        }
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  finalizeResult: async (root, data, { db: { Oracles, Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.FINALIZERESULT });
    const { oracleAddress, senderAddress } = tx;

    // Fetch oracle to get the finalized result
    const oracle = await Oracles.findOne({ address: oracleAddress }, { options: 1, optionIdxs: 1 });
    if (!oracle) {
      getLogger().error(`Could not find Oracle ${oracleAddress} in DB.`);
      throw Error(`Could not find Oracle ${oracleAddress} in DB.`);
    } else {
      // Compare optionIdxs to options since optionIdxs will be missing the index of the last round's result
      for (let i = 0; i < oracle.options.length; i++) {
        if (!includes(oracle.optionIdxs, i)) {
          tx.optionIdx = i;
          break;
        }
      }
    }

    if (needsToExecuteTx(tx)) {
      // Send finalizeResult
      try {
        const { txid, args: { gasLimit, gasPrice } } = await DecentralizedOracle.finalizeResult({
          contractAddress: oracleAddress,
          senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling DecentralizedOracle.finalizeResult: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  withdraw: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data);
    const { type, topicAddress, senderAddress } = tx;

    if (needsToExecuteTx(tx)) {
      switch (type) {
        case TX_TYPE.WITHDRAW: {
          // Send withdrawWinnings tx
          try {
            const { txid, args: { gasLimit, gasPrice } } = await TopicEvent.withdrawWinnings({
              contractAddress: topicAddress,
              senderAddress,
            });
            tx = Object.assign(tx, { txid, gasLimit, gasPrice });
          } catch (err) {
            getLogger().error(`Error calling TopicEvent.withdrawWinnings: ${err.message}`);
            throw err;
          }
          break;
        }
        case TX_TYPE.WITHDRAWESCROW: {
          // Send withdrawEscrow tx
          try {
            const { txid, args: { gasLimit, gasPrice } } = await TopicEvent.withdrawEscrow({
              contractAddress: topicAddress,
              senderAddress,
            });
            tx = Object.assign(tx, { txid, gasLimit, gasPrice });
          } catch (err) {
            getLogger().error(`Error calling TopicEvent.withdrawEscrow: ${err.message}`);
            throw err;
          }
          break;
        }
        default: {
          throw Error(`Invalid withdraw type: ${type}`);
        }
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  transfer: async (root, data, { db: { Transactions } }) => {
    const {
      senderAddress,
      receiverAddress,
      token,
      amount,
    } = data;

    const version = Config.CONTRACT_VERSION_NUM;

    let txid;
    let sentTx;
    switch (token) {
      case TOKEN.QTUM: {
        // Send sendToAddress tx
        try {
          txid = await Wallet.sendToAddress({
            address: receiverAddress,
            amount,
            senderAddress,
            changeToAddress: true,
          });
        } catch (err) {
          getLogger().error(`Error calling Wallet.sendToAddress: ${err.message}`);
          throw err;
        }
        break;
      }
      case TOKEN.BOT: {
        // Send transfer tx
        try {
          sentTx = await BodhiToken.transfer({
            to: receiverAddress,
            value: amount,
            senderAddress,
          });
          txid = sentTx.txid;
        } catch (err) {
          getLogger().error(`Error calling BodhiToken.transfer: ${err.message}`);
          throw err;
        }
        break;
      }
      default: {
        throw Error(`Invalid token transfer type: ${token}`);
      }
    }

    // Insert Transaction
    const gasLimit = sentTx ? sentTx.args.gasLimit : Config.DEFAULT_GAS_LIMIT;
    const gasPrice = sentTx ? sentTx.args.gasPrice : Config.DEFAULT_GAS_PRICE;
    const tx = new Transaction({
      type: TX_TYPE.TRANSFER,
      txid,
      status: TX_STATE.PENDING,
      createdBlock: await getBlockNum(),
      createdTime: moment().unix(),
      gasLimit: gasLimit.toString(10),
      gasPrice: gasPrice.toFixed(8),
      senderAddress,
      version,
      receiverAddress,
      token,
      amount,
    });
    await DBHelper.insertTransaction(Transactions, tx);

    return tx;
  },
};
