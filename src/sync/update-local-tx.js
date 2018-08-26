const { each, isEmpty } = require('lodash');
const moment = require('moment');

const { getLogger } = require('../utils/logger');
const blockchain = require('../api/blockchain');
const wallet = require('../api/wallet');
const bodhiToken = require('../api/bodhi-token');
const eventFactory = require('../api/event-factory');
const centralizedOracle = require('../api/centralized-oracle');
const decentralizedOracle = require('../api/decentralized-oracle');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');
const { Config, getContractMetadata } = require('../config');
const { txState } = require('../constants');
const Utils = require('../utils');

async function updatePendingTxs(currentBlockCount) {
  let pendingTxs;
  try {
    pendingTxs = await db.Transactions.cfind({ status: txState.PENDING }).sort({ createdTime: -1 }).exec();
  } catch (err) {
    getLogger().error(`Get pending txs: ${err.message}`);
    return;
  }

  // TODO: batch to avoid too many rpc calls
  const updatePromises = [];
  each(pendingTxs, (tx) => {
    updatePromises.push(new Promise(async (resolve) => {
      await updateTx(tx, currentBlockCount);
      await updateDB(tx);
      resolve();
    }));
  });
  await Promise.all(updatePromises);
}

// Update the Transaction info
async function updateTx(tx, currentBlockCount) {
  // sendtoaddress does not use the same confirmation method as EVM txs
  if (tx.type === 'TRANSFER' && tx.token === 'QTUM' && !tx.blockNum) {
    const txInfo = await wallet.getTransaction({ txid: tx.txid });

    if (txInfo.confirmations > 0) {
      tx.status = txState.SUCCESS;
      tx.gasUsed = Math.floor(Math.abs(txInfo.fee) / Config.DEFAULT_GAS_PRICE);

      tx.blockNum = (currentBlockCount - txInfo.confirmations) + 1;
      const blockHash = await blockchain.getBlockHash({ blockNum: tx.blockNum });
      const blockInfo = await blockchain.getBlock({ blockHash });
      tx.blockTime = blockInfo.time;
    }
    return;
  }

  // Update tx status based on EVM tx logs
  const resp = await blockchain.getTransactionReceipt({ transactionId: tx.txid });

  // Response has no receipt, still not accepted by blockchain
  if (isEmpty(resp)) {
    tx.status = txState.PENDING;
    return;
  }

  // Receipt found, update existing pending tx
  const { log, gasUsed, blockNumber, blockHash } = resp[0];
  tx.status = isEmpty(log) ? txState.FAIL : txState.SUCCESS;
  tx.gasUsed = gasUsed;
  tx.blockNum = blockNumber;
  const blockInfo = await blockchain.getBlock({ blockHash });
  tx.blockTime = blockInfo.time;
}

// Update the DB with new Transaction info
async function updateDB(tx) {
  if (tx.status !== txState.PENDING) {
    try {
      getLogger().debug(`Update: ${tx.status} Transaction ${tx.type} txid:${tx.txid}`);
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

// Execute follow-up transaction for successful txs
async function onSuccessfulTx(tx) {
  const { Oracles, Transactions } = db;
  let sentTx;

  switch (tx.type) {
    // Approve was accepted. Sending createEvent.
    case 'APPROVECREATEEVENT': {
      try {
        sentTx = await eventFactory.createTopic({
          oracleAddress: tx.resultSetterAddress,
          eventName: tx.name,
          resultNames: tx.options,
          bettingStartTime: tx.bettingStartTime,
          bettingEndTime: tx.bettingEndTime,
          resultSettingStartTime: tx.resultSettingStartTime,
          resultSettingEndTime: tx.resultSettingEndTime,
          senderAddress: tx.senderAddress,
        });
      } catch (err) {
        getLogger().error(`onSuccessfulTx EventFactory.createTopic: ${err.message}`);
        return;
      }

      // Update Topic's approve txid with the createTopic txid
      await DBHelper.updateObjectByQuery(db.Topics, { txid: tx.txid }, { txid: sentTx.txid });

      // Update Oracle's approve txid with the createTopic txid
      await DBHelper.updateObjectByQuery(db.Oracles, { txid: tx.txid }, { txid: sentTx.txid });

      await DBHelper.insertTransaction(Transactions, {
        txid: sentTx.txid,
        version: tx.version,
        type: 'CREATEEVENT',
        status: txState.PENDING,
        gasLimit: sentTx.args.gasLimit.toString(10),
        gasPrice: sentTx.args.gasPrice.toFixed(8),
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
      break;
    }

    // Approve was accepted. Sending setResult.
    case 'APPROVESETRESULT': {
      try {
        sentTx = await centralizedOracle.setResult({
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

        sentTx = await decentralizedOracle.vote({
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
    sentTx = await bodhiToken.approve({
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
