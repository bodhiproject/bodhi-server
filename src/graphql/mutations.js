const { includes, fill } = require('lodash');
const moment = require('moment');
const crypto = require('crypto');

const { TX_STATE, TX_TYPE, TOKEN, STATUS } = require('../constants');
const { Config, getContractMetadata } = require('../config');
const DBHelper = require('../db/db-helper');
const { getVotingGasLimit } = require('../utils');
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
    createdTime: data.createdTime || moment().unix(),
    gasLimit: data.gasLimit,
    gasPrice: data.gasPrice,
  }));
  await DBHelper.insertTransaction(db, tx);
  return tx;
};

module.exports = {
  resetApprove: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.RESETAPPROVE, token: TOKEN.BOT, amount: '0', version: 0 });

    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await BodhiToken.approve({
          spender: tx.receiverAddress,
          value: tx.amount,
          senderAddress: tx.senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  approveCreateEvent: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.APPROVECREATEEVENT, token: TOKEN.BOT, version: 0 });

    // Check for existing ApproveCreateEvent or CreateEvent transactions
    if (await DBHelper.isPreviousCreateEventPending(Transactions, tx.senderAddress)) {
      throw Error('Pending CreateEvent transaction found');
    }

    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await BodhiToken.approve({
          spender: getContractMetadata().AddressManager.address,
          value: tx.amount,
          senderAddress: tx.senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  createEvent: async (root, data, { db: { Topics, Oracles, Transactions } }) => {
    let tx = Object.assign({}, data, {
      type: TX_TYPE.CREATEEVENT,
      createdTime: moment().unix(),
      token: TOKEN.BOT,
      version: 0,
    });
    const {
      createdTime,
      senderAddress,
      name,
      options,
      resultSetterAddress,
      bettingStartTime,
      bettingEndTime,
      resultSettingStartTime,
      resultSettingEndTime,
      amount,
      version,
    } = tx;

    // Check for existing ApproveCreateEvent or CreateEvent transactions
    if (await DBHelper.isPreviousCreateEventPending(Transactions, senderAddress)) {
      throw Error('Pending CreateEvent transaction found');
    }

    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await EventFactory.createTopic({
          eventName: name,
          resultNames: options,
          oracleAddress: resultSetterAddress,
          bettingStartTime,
          bettingEndTime,
          resultSettingStartTime,
          resultSettingEndTime,
          senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling EventFactory.createTopic: ${err.message}`);
        throw err;
      }
    }

    const { txid } = tx;
    const hashId = crypto.createHash('md5').update(`${createdTime}${name}`).digest('hex');

    // Insert unconfirmed Topic
    await DBHelper.insertTopic(Topics, {
      txid,
      hashId,
      status: STATUS.CREATED,
      name,
      options,
      qtumAmount: fill(Array(options), '0'),
      botAmount: fill(Array(options), '0'),
      escrowAmount: amount,
      creatorAddress: senderAddress,
      version,
    });
    getLogger().debug(`Mutation Insert: Topic txid:${txid}`);

    // Insert unconfirmed Oracle
    await DBHelper.insertOracle(Oracles, {
      txid,
      hashId,
      status: STATUS.CREATED,
      name,
      options,
      optionIdxs: Array.from(Array(options).keys()),
      amounts: fill(Array(options), '0'),
      resultSetterAddress,
      startTime: bettingStartTime,
      endTime: bettingEndTime,
      resultSetStartTime: resultSettingStartTime,
      resultSetEndTime: resultSettingEndTime,
      token: TOKEN.QTUM,
      version,
    });
    getLogger().debug(`Mutation Insert: Oracle txid:${txid}`);

    return insertPendingTx(Transactions, tx);
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
    let tx = Object.assign({}, data, { type: TX_TYPE.APPROVESETRESULT, token: TOKEN.BOT, version: 0 });

    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await BodhiToken.approve({
          spender: tx.topicAddress,
          value: tx.amount,
          senderAddress: tx.senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  setResult: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.SETRESULT, token: TOKEN.BOT, version: 0 });

    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await CentralizedOracle.setResult({
          contractAddress: tx.oracleAddress,
          resultIndex: tx.optionIdx,
          senderAddress: tx.senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling CentralizedOracle.setResult: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  approveVote: async (root, data, { db: { Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.APPROVEVOTE, token: TOKEN.BOT, version: 0 });

    if (needsToExecuteTx(tx)) {
      try {
        const { txid, args: { gasLimit, gasPrice } } = await BodhiToken.approve({
          spender: tx.topicAddress,
          value: tx.amount,
          senderAddress: tx.senderAddress,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling BodhiToken.approve: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  createVote: async (root, data, { db: { Oracles, Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.VOTE, token: TOKEN.BOT, version: 0 });
    const { oracleAddress, optionIdx, amount } = tx;

    if (needsToExecuteTx(tx)) {
      try {
        // Find if voting over threshold to set correct gas limit
        const voteGasLimit = await getVotingGasLimit(Oracles, oracleAddress, optionIdx, amount);

        const { txid, args: { gasLimit, gasPrice } } = await DecentralizedOracle.vote({
          contractAddress: oracleAddress,
          resultIndex: optionIdx,
          botAmount: amount,
          senderAddress: tx.senderAddress,
          gasLimit: voteGasLimit,
        });
        tx = Object.assign(tx, { txid, gasLimit, gasPrice });
      } catch (err) {
        getLogger().error(`Error calling DecentralizedOracle.vote: ${err.message}`);
        throw err;
      }
    }

    return insertPendingTx(Transactions, tx);
  },

  finalizeResult: async (root, data, { db: { Oracles, Transactions } }) => {
    let tx = Object.assign({}, data, { type: TX_TYPE.FINALIZERESULT, version: 0 });
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
    let tx = Object.assign({}, data, { version: 0 });
    if (!includes([TX_TYPE.WITHDRAW, TX_TYPE.WITHDRAWESCROW], tx.type)) {
      throw Error('Invalid type. Should be one of: [WITHDRAW, WITHDRAWESCROW].');
    }

    if (needsToExecuteTx(tx)) {
      const { type, topicAddress, senderAddress } = tx;
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
