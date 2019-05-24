const { each, isNull } = require('lodash');
const { web3 } = require('../web3');
const { TX_STATUS } = require('../constants');
const { getAbiObject } = require('../utils');
const { logger } = require('../utils/logger');
const { getTransactionReceipt } = require('../utils/web3-utils');
const DBHelper = require('../db/db-helper');
const Withdraw = require('../models/withdraw');

const getAbiObj = (contractMetadata) => {
  const abiObj = getAbiObject(
    contractMetadata.MultipleResultsEvent.abi,
    'WinningsWithdrawn',
    'event',
  );
  if (!abiObj) throw Error('WinningsWithdrawn event not found in ABI');
  return abiObj;
};

/**
 * Gets the block numbers needed to parse logs for.
 * Also returns tx receipts for confirmed pending items.
 * @param {number} currBlockNum Current block number
 * @return {object} Block numbers and tx receipts
 */
const getBlocksAndReceipts = async (currBlockNum) => {
  const blockNums = [currBlockNum];
  const txReceipts = {};
  const promises = [];

  const pending = await DBHelper.findWithdraw({ txStatus: TX_STATUS.PENDING });
  each(pending, async (pendingBet) => {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const txReceipt = await getTransactionReceipt(pendingBet.txid);
        if (!isNull(txReceipt)) {
          if (!blockNums.includes(txReceipt.blockNum)) {
            blockNums.push(txReceipt.blockNum);
          }
          txReceipts[pendingBet.txid] = txReceipt;
        }
        resolve();
      } catch (err) {
        logger().error(`getBlocksAndReceipts: ${err.message}`);
        reject();
      }
    }));
  });
  await Promise.all(promises);

  return { blockNums, txReceipts };
};

const getLogs = async ({ naka, abiObj, blockNum }) => {
  const eventSig = naka.eth.abi.encodeEventSignature(abiObj);
  return naka.eth.getPastLogs({
    fromBlock: blockNum,
    toBlock: blockNum,
    topics: [eventSig],
  });
};

const parseLog = async ({ naka, abiObj, log }) => {
  // TODO: uncomment when web3 decodeLog works. broken in 1.0.0-beta.54.
  // const {
  //   eventAddress,
  //   winner,
  //   winningAmount,
  //   escrowAmount,
  // } = naka.eth.abi.decodeLog(abiObj.inputs, log.data, log.topics);

  const eventAddress = naka.eth.abi.decodeParameter('address', log.topics[1]);
  const winnerAddress = naka.eth.abi.decodeParameter('address', log.topics[2]);
  const decodedData = naka.eth.abi.decodeParameters(
    ['uint256', 'uint256'],
    log.data,
  );
  const winningAmount = decodedData['0'];
  const escrowWithdrawAmount = decodedData['1'];

  return new Withdraw({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    winnerAddress,
    winningAmount: winningAmount.toString(10),
    escrowWithdrawAmount: escrowWithdrawAmount.toString(10),
  });
};

module.exports = async (contractMetadata, currBlockNum) => {
  try {
    const naka = web3();
    const abiObj = getAbiObj(contractMetadata);
    const { blockNums, txReceipts } = await getBlocksAndReceipts(currBlockNum);

    const promises = [];
    each(blockNums, (blockNum) => {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          // Parse each withdraw and insert
          const logs = await getLogs({ naka, abiObj, blockNum });
          each(logs, async (log) => {
            const withdraw = await parseLog({ naka, abiObj, log });
            await DBHelper.insertWithdraw(withdraw);

            // Update tx receipt
            let txReceipt = txReceipts[withdraw.txid];
            if (!txReceipt) txReceipt = await getTransactionReceipt(withdraw.txid);
            await DBHelper.insertTransactionReceipt(txReceipt);
          });

          resolve();
        } catch (insertErr) {
          logger().error(`insert Withdraw: ${insertErr.message}`);
          reject(insertErr);
        }
      }));
    });
    await Promise.all(promises);
  } catch (err) {
    throw Error('Error syncWinningsWithdrawn:', err);
  }
};
