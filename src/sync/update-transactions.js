const { map, each, isEmpty } = require('lodash');
const moment = require('moment');

const Blockchain = require('../api/blockchain');
const Wallet = require('../api/wallet');
const EventFactory = require('../api/event-factory');
const CentralizedOracle = require('../api/centralized-oracle');
const DecentralizedOracle = require('../api/decentralized-oracle');
const Utils = require('../utils');
const { getLogger } = require('../utils/logger');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');
const { Config } = require('../config');
const { TX_STATE, TX_TYPE, TOKEN } = require('../constants');
const Transaction = require('../models/transaction');
const { publishOnApproveSuccess } = require('../graphql/subscriptions');

/**
 * Updates all pending transactions.
 * @param {number} currentBlockCount Current block number.
 */
async function updatePendingTxs(currentBlockCount) {
  let pendingTxs;
  try {
    pendingTxs = await db.Transactions.cfind({ status: TX_STATE.PENDING }).sort({ createdTime: -1 }).exec();
    pendingTxs = map(pendingTxs, tx => new Transaction(tx));
  } catch (err) {
    getLogger().error(`Get pending txs: ${err.message}`);
    throw Error(`Get pending txs: ${err.message}`);
  }

  each(pendingTxs, async (tx) => {
    await updateTx(tx, currentBlockCount);
    await updateDB(tx, currentBlockCount);
  });
}

/**
 * Updates a transaction based on the type.
 * @param {Transaction} tx Transaction to update.
 * @param {number} currentBlockCount Current block number.
 */
async function updateTx(tx, currentBlockCount) {
  // sendtoaddress does not use the same confirmation method as EVM txs
  if (tx.type === TX_TYPE.TRANSFER && tx.token === TOKEN.QTUM && !tx.blockNum) {
    await updateQtumTransferTx(tx, currentBlockCount);
    return;
  }

  // Update tx status based on EVM tx logs
  await updateEvmTx(tx);
}

/**
 * Updates a Qtum transfer tx. The confirmation method is not the same as an EVM tx confirmation.
 * @param {Transaction} tx Transaction to update.
 * @param {number} currentBlockCount Current block number.
 */
async function updateQtumTransferTx(tx, currentBlockCount) {
  try {
    const txInfo = await Wallet.getTransaction({ txid: tx.txid });

    if (txInfo.confirmations > 0) {
      const status = TX_STATE.SUCCESS;
      const gasUsed = Math.floor(Math.abs(txInfo.fee) / Config.DEFAULT_GAS_PRICE);
      const blockNum = (currentBlockCount - txInfo.confirmations) + 1;
      const blockHash = await Blockchain.getBlockHash({ blockNum: tx.blockNum });
      const blockTime = (await Blockchain.getBlock({ blockHash })).time;
      tx.onConfirmed(status, blockNum, blockTime, gasUsed);
    }
  } catch (err) {
    getLogger().error(`updateQtumTransferTx: ${err.message}`);
    throw Error(`updateQtumTransferTx: ${err.message}`);
  }
}

/**
 * Updates an EVM tx based on the returned logs.
 * @param {Transaction} tx Transaction to update.
 */
async function updateEvmTx(tx) {
  try {
    const resp = await Blockchain.getTransactionReceipt({ transactionId: tx.txid });

    // Response has no receipt, still not written to blockchain
    if (isEmpty(resp)) {
      tx.status = TX_STATE.PENDING;
      return;
    }

    // Receipt found, update existing pending tx
    const { log, gasUsed, blockNumber, blockHash } = resp[0];
    const status = isEmpty(log) ? TX_STATE.FAIL : TX_STATE.SUCCESS;
    const blockNum = blockNumber;
    const blockTime = (await Blockchain.getBlock({ blockHash })).time;
    tx.onConfirmed(status, blockNum, blockTime, gasUsed);
  } catch (err) {
    getLogger().error(`updateEvmTx: ${err.message}`);
    throw Error(`updateEvmTx: ${err.message}`);
  }
}

/**
 * Update the DB with new transaction info.
 * @param {Transaction} tx Updated transaction.
 * @param {number} currentBlockCount Current block number.
 */
async function updateDB(tx, currentBlockCount) {
  if (tx.status !== TX_STATE.PENDING) {
    try {
      const updateRes = await db.Transactions.update(
        { txid: tx.txid },
        {
          $set: {
            status: tx.status,
            gasUsed: tx.gasUsed,
            blockNum: tx.blockNum,
          },
        },
        { returnUpdatedDocs: true },
      );
      const updatedTx = updateRes[1];

      // Execute follow up tx
      if (updatedTx) {
        switch (updatedTx.status) {
          case TX_STATE.SUCCESS: {
            await onSuccessfulTx(updatedTx, currentBlockCount);
            break;
          }
          case TX_STATE.FAIL: {
            await onFailedTx(updatedTx);
            break;
          }
          default: {
            break;
          }
        }
      }
    } catch (err) {
      getLogger().error(`updateDB: ${tx.type} txid:${tx.txid} ${err.message}`);
      throw Error(`updateDB: ${tx.type} txid:${tx.txid} ${err.message}`);
    }
  }
}

/**
 * Execute follow-up transaction for successful txs.
 * @param {Transaction} tx Successful transaction.
 * @param {number} currentBlockCount Current block number.
 */
async function onSuccessfulTx(tx, currentBlockCount) {
  switch (tx.type) {
    case TX_TYPE.APPROVECREATEEVENT: {
      await executeCreateEvent(tx, currentBlockCount);
      break;
    }
    case TX_TYPE.APPROVESETRESULT: {
      await executeSetResult(tx, currentBlockCount);
      break;
    }
    case TX_TYPE.APPROVEVOTE: {
      await executeVote(tx, currentBlockCount);
      break;
    }
    default: {
      break;
    }
  }

  // Send subscription message
  publishOnApproveSuccess(tx);
}

/**
 * The approve for a create event was accepted. Execute the create event tx.
 * @param {Transaction} tx Accepted APPROVECREATEEVENT tx.
 * @param {number} currentBlockCount Current block number.
 */
async function executeCreateEvent(tx, currentBlockCount) {
  try {
    const createEventTx = await EventFactory.createTopic({
      oracleAddress: tx.resultSetterAddress,
      eventName: tx.name,
      resultNames: tx.options,
      bettingStartTime: tx.bettingStartTime,
      bettingEndTime: tx.bettingEndTime,
      resultSettingStartTime: tx.resultSettingStartTime,
      resultSettingEndTime: tx.resultSettingEndTime,
      senderAddress: tx.senderAddress,
    });

    // Update Topic's approve txid with the createTopic txid
    await DBHelper.updateObjectByQuery(db.Topics, { txid: tx.txid }, { txid: createEventTx.txid });

    // Update Oracle's approve txid with the createTopic txid
    await DBHelper.updateObjectByQuery(db.Oracles, { txid: tx.txid }, { txid: createEventTx.txid });

    await DBHelper.insertTransaction(db.Transactions, {
      type: TX_TYPE.CREATEEVENT,
      txid: createEventTx.txid,
      version: tx.version,
      status: TX_STATE.PENDING,
      gasLimit: createEventTx.args.gasLimit.toString(10),
      gasPrice: createEventTx.args.gasPrice.toFixed(8),
      createdBlock: currentBlockCount,
      createdTime: moment().unix(),
      senderAddress: tx.senderAddress,
      name: tx.name,
      options: tx.options,
      resultSetterAddress: tx.resultSetterAddress,
      bettingStartTime: tx.bettingStartTime,
      bettingEndTime: tx.bettingEndTime,
      resultSettingStartTime: tx.resultSettingStartTime,
      resultSettingEndTime: tx.resultSettingEndTime,
      amount: tx.amount,
      token: tx.token,
    });
  } catch (err) {
    getLogger().error(`executeCreateEvent: ${err.message}`);
    throw Error(`executeCreateEvent: ${err.message}`);
  }
}

/**
 * The approve for a set result was accepted. Execute the set result tx.
 * @param {Transaction} tx Accepted APPROVESETRESULT tx.
 * @param {number} currentBlockCount Current block number.
 */
async function executeSetResult(tx, currentBlockCount) {
  try {
    const setResultTx = await CentralizedOracle.setResult({
      contractAddress: tx.oracleAddress,
      resultIndex: tx.optionIdx,
      senderAddress: tx.senderAddress,
    });

    await DBHelper.insertTransaction(db.Transactions, {
      type: TX_TYPE.SETRESULT,
      txid: setResultTx.txid,
      version: tx.version,
      status: TX_STATE.PENDING,
      gasLimit: setResultTx.args.gasLimit.toString(10),
      gasPrice: setResultTx.args.gasPrice.toFixed(8),
      createdBlock: currentBlockCount,
      createdTime: moment().unix(),
      senderAddress: tx.senderAddress,
      topicAddress: tx.topicAddress,
      oracleAddress: tx.oracleAddress,
      optionIdx: tx.optionIdx,
      token: TOKEN.BOT,
      amount: tx.amount,
    });
  } catch (err) {
    getLogger().error(`executeSetResult: ${err.message}`);
    throw Error(`executeSetResult: ${err.message}`);
  }
}

/**
 * The approve for a vote was accepted. Execute the vote tx.
 * @param {Transaction} tx Accepted APPROVEVOTE tx.
 * @param {number} currentBlockCount Current block number.
 */
async function executeVote(tx, currentBlockCount) {
  try {
    // Find if voting over threshold to set correct gas limit
    const gasLimit = await Utils.getVotingGasLimit(db.Oracles, tx.oracleAddress, tx.optionIdx, tx.amount);

    const voteTx = await DecentralizedOracle.vote({
      contractAddress: tx.oracleAddress,
      resultIndex: tx.optionIdx,
      botAmount: tx.amount,
      senderAddress: tx.senderAddress,
      gasLimit,
    });

    await DBHelper.insertTransaction(db.Transactions, {
      type: TX_TYPE.VOTE,
      txid: voteTx.txid,
      version: tx.version,
      status: TX_STATE.PENDING,
      gasLimit: voteTx.args.gasLimit.toString(10),
      gasPrice: voteTx.args.gasPrice.toFixed(8),
      createdBlock: currentBlockCount,
      createdTime: moment().unix(),
      senderAddress: tx.senderAddress,
      topicAddress: tx.topicAddress,
      oracleAddress: tx.oracleAddress,
      optionIdx: tx.optionIdx,
      token: TOKEN.BOT,
      amount: tx.amount,
    });
  } catch (err) {
    getLogger().error(`executeVote: ${err.message}`);
    throw Error(`executeVote: ${err.message}`);
  }
}

/**
 * Execute follow-up transaction for failed txs.
 * @param {Transaction} tx Failed transaction.
 */
async function onFailedTx(tx) {
  switch (tx.type) {
    case TX_TYPE.APPROVECREATEEVENT:
    case TX_TYPE.CREATEEVENT: {
      await removeCreatedTopicAndOracle(tx);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * Removes the Topic and Centralized Oracle from the DB since the tx failed.
 * @param {Transaction} tx Failed transaction.
 */
async function removeCreatedTopicAndOracle(tx) {
  try {
    await DBHelper.removeTopicsByQuery(db.Topics, { txid: tx.txid });
    await DBHelper.removeOraclesByQuery(db.Oracles, { txid: tx.txid });
  } catch (err) {
    getLogger().error(`removeCreatedTopicAndOracle: ${err.message}`);
    throw Error(`removeCreatedTopicAndOracle: ${err.message}`);
  }
}

module.exports = updatePendingTxs;
