const { map, each, isEmpty } = require('lodash');
const moment = require('moment');

const Blockchain = require('../api/blockchain');
const Wallet = require('../api/wallet');
const BodhiToken = require('../api/bodhi-token');
const EventFactory = require('../api/event-factory');
const CentralizedOracle = require('../api/centralized-oracle');
const DecentralizedOracle = require('../api/decentralized-oracle');
const Utils = require('../utils');
const { getLogger } = require('../utils/logger');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');
const { Config, getContractMetadata } = require('../config');
const { txState, TX_TYPE } = require('../constants');
const Transaction = require('../models/transaction');

async function updatePendingTxs(currentBlockCount) {
  try {
    let pendingTxs = await db.Transactions.cfind({ status: txState.PENDING }).sort({ createdTime: -1 }).exec();
    pendingTxs = map(pendingTxs, tx => new Transaction(tx));
    each(pendingTxs, async (tx) => {
      await updateTx(tx, currentBlockCount);
      await updateDB(tx);
    });
  } catch (err) {
    getLogger().error(`Get pending txs: ${err.message}`);
  }
}

// Update the Transaction info
async function updateTx(tx, currentBlockCount) {
  // sendtoaddress does not use the same confirmation method as EVM txs
  if (tx.type === 'TRANSFER' && tx.token === 'QTUM' && !tx.blockNum) {
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
  const txInfo = await Wallet.getTransaction({ txid: tx.txid });

  if (txInfo.confirmations > 0) {
    const status = txState.SUCCESS;
    const gasUsed = Math.floor(Math.abs(txInfo.fee) / Config.DEFAULT_GAS_PRICE);
    const blockNum = (currentBlockCount - txInfo.confirmations) + 1;
    const blockHash = await Blockchain.getBlockHash({ blockNum: tx.blockNum });
    const blockTime = (await Blockchain.getBlock({ blockHash })).time;
    tx.onConfirmed(status, blockNum, blockTime, gasUsed);
  }
}

/**
 * Updates an EVM tx based on the returned logs.
 * @param {Transaction} tx Transaction to update.
 */
async function updateEvmTx(tx) {
  const resp = await Blockchain.getTransactionReceipt({ transactionId: tx.txid });

  // Response has no receipt, still not written to blockchain
  if (isEmpty(resp)) {
    tx.status = txState.PENDING;
    return;
  }

  // Receipt found, update existing pending tx
  const { log, gasUsed, blockNumber, blockHash } = resp[0];
  const status = isEmpty(log) ? txState.FAIL : txState.SUCCESS;
  const blockNum = blockNumber;
  const blockTime = (await Blockchain.getBlock({ blockHash })).time;
  tx.onConfirmed(status, blockNum, blockTime, gasUsed);
}

/**
 * Update the DB with new transaction info.
 * @param {Transaction} tx Updated transaction.
 */
async function updateDB(tx) {
  if (tx.status !== txState.PENDING) {
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
          case txState.SUCCESS: {
            await onSuccessfulTx(updatedTx);
            break;
          }
          case txState.FAIL: {
            await onFailedTx(updatedTx);
            break;
          }
          default: {
            break;
          }
        }
      }
    } catch (err) {
      getLogger().error(`Update Transaction ${tx.type} txid:${tx.txid} ${err.message}`);
    }
  }
}

/**
 * Execute follow-up transaction for successful txs.
 * @param {Transaction} tx Updated transaction.
 */
async function onSuccessfulTx(tx) {
  const { Oracles, Transactions } = db;
  let sentTx;

  switch (tx.type) {
    case 'APPROVECREATEEVENT': {
      executeCreateEvent(tx);
      break;
    }

    // Approve was accepted. Sending setResult.
    case 'APPROVESETRESULT': {
      try {
        sentTx = await CentralizedOracle.setResult({
          contractAddress: tx.oracleAddress,
          resultIndex: tx.optionIdx,
          senderAddress: tx.senderAddress,
        });
      } catch (err) {
        getLogger().error(`onSuccessfulTx CentralizedOracle.setResult: ${err.message}`);
        return;
      }

      await DBHelper.insertTransaction(Transactions, {
        txid: sentTx.txid,
        version: tx.version,
        type: 'SETRESULT',
        status: txState.PENDING,
        gasLimit: sentTx.args.gasLimit.toString(10),
        gasPrice: sentTx.args.gasPrice.toFixed(8),
        createdTime: moment().unix(),
        senderAddress: tx.senderAddress,
        topicAddress: tx.topicAddress,
        oracleAddress: tx.oracleAddress,
        optionIdx: tx.optionIdx,
        token: 'BOT',
        amount: tx.amount,
      });
      break;
    }

    // Approve was accepted. Sending vote.
    case 'APPROVEVOTE': {
      try {
        // Find if voting over threshold to set correct gas limit
        const gasLimit = await Utils.getVotingGasLimit(Oracles, tx.oracleAddress, tx.optionIdx, tx.amount);

        sentTx = await DecentralizedOracle.vote({
          contractAddress: tx.oracleAddress,
          resultIndex: tx.optionIdx,
          botAmount: tx.amount,
          senderAddress: tx.senderAddress,
          gasLimit,
        });
      } catch (err) {
        getLogger().error(`onSuccessfulTx DecentralizedOracle.vote: ${err.message}`);
        return;
      }

      await DBHelper.insertTransaction(Transactions, {
        txid: sentTx.txid,
        version: tx.version,
        type: 'VOTE',
        status: txState.PENDING,
        gasLimit: sentTx.args.gasLimit.toString(10),
        gasPrice: sentTx.args.gasPrice.toFixed(8),
        createdTime: moment().unix(),
        senderAddress: tx.senderAddress,
        topicAddress: tx.topicAddress,
        oracleAddress: tx.oracleAddress,
        optionIdx: tx.optionIdx,
        token: 'BOT',
        amount: tx.amount,
      });
      break;
    }

    default: {
      break;
    }
  }
}

/**
 * The approve for a create event was accepted. Execute the create event tx.
 * @param {Transaction} tx Accepted APPROVECREATEEVENT tx.
 */
async function executeCreateEvent(tx) {
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
      status: txState.PENDING,
      gasLimit: createEventTx.args.gasLimit.toString(10),
      gasPrice: createEventTx.args.gasPrice.toFixed(8),
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
  }
}

// Execute follow-up transaction for failed txs
async function onFailedTx(tx) {
  switch (tx.type) {
    // Approve failed. Reset allowance and delete created Topic/COracle.
    case 'APPROVECREATEEVENT': {
      resetApproveAmount(tx, getContractMetadata().AddressManager.address);
      removeCreatedTopicAndOracle(tx);
      break;
    }

    // CreateTopic failed. Delete created Topic/COracle.
    case 'CREATEEVENT': {
      removeCreatedTopicAndOracle(tx);
      break;
    }

    // Approve failed. Reset allowance.
    case 'APPROVESETRESULT':
    case 'APPROVEVOTE': {
      resetApproveAmount(tx, tx.topicAddress);
      break;
    }

    default: {
      break;
    }
  }
}

// Failed approve tx so call approve for 0.
async function resetApproveAmount(tx, spender) {
  let sentTx;
  try {
    sentTx = await BodhiToken.approve({
      spender,
      value: 0,
      senderAddress: tx.senderAddress,
    });
  } catch (err) {
    getLogger().error(`resetApproveAmount BodhiToken.approve: ${err.message}`);
    return;
  }

  await DBHelper.insertTransaction(db.Transactions, {
    txid: sentTx.txid,
    type: 'RESETAPPROVE',
    status: txState.PENDING,
    gasLimit: sentTx.args.gasLimit.toString(10),
    gasPrice: sentTx.args.gasPrice.toFixed(8),
    createdTime: moment().unix(),
    version: tx.version,
    senderAddress: tx.senderAddress,
    topicAddress: tx.topicAddress,
    oracleAddress: tx.oracleAddress,
    name: tx.name,
  });
}

// Remove created Topic/COracle because tx failed
async function removeCreatedTopicAndOracle(tx) {
  await DBHelper.removeTopicsByQuery(db.Topics, { txid: tx.txid });
  await DBHelper.removeOraclesByQuery(db.Oracles, { txid: tx.txid });
}

module.exports = updatePendingTxs;
