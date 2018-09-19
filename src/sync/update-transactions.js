const { map, each, isEmpty } = require('lodash');

const Blockchain = require('../api/blockchain');
const Wallet = require('../api/wallet');
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
    await updateDB(tx);
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
    const blockTime = (await Blockchain.getBlock({ blockHash })).time;
    tx.onConfirmed(status, blockNumber, blockTime, gasUsed);
  } catch (err) {
    getLogger().error(`updateEvmTx: ${err.message}`);
    throw Error(`updateEvmTx: ${err.message}`);
  }
}

/**
 * Update the DB with new transaction info.
 * @param {Transaction} tx Updated transaction.
 */
async function updateDB(tx) {
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
            publishOnApproveSuccess(updatedTx);
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
