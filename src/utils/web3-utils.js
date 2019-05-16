const { isNull } = require('lodash');
const web3 = require('../web3');
const TransactionReceipt = require('../models/tx-receipt');

/**
 * Gets the pending tx and conforms it to the TransactionReceipt model.
 * @param {string} txid Transaction ID
 * @return {TransactionReceipt} Transaction receipt
 */
const getTransaction = async (txid) => {
  const tx = web3().eth.getTransaction(txid);
  return new TransactionReceipt({
    transactionHash: tx.hash,
    blockHash: tx.blockHash,
    blockNumber: tx.blockNumber,
    from: tx.from,
    to: tx.to,
    cumulativeGasUsed: tx.gas,
    gasUsed: tx.gas,
    gasPrice: tx.gasPrice,
  });
};

/**
 * Gets the transaction receipt.
 * @param {string} txid Transaction ID
 * @return {TransactionReceipt|null} Transaction receipt or null
 */
const getTransactionReceipt = async (txid) => {
  const receipt = await web3().eth.getTransactionReceipt(txid);
  if (isNull(receipt)) return null;
  return new TransactionReceipt(receipt);
};

/**
 * Sums two numbers after converting both to BNs.
 * @param {string|number} first First number to add
 * @param {string|number} second Second number to add
 * @return {BN} BN instance
 */
const sumBN = (first, second) => {
  const { utils } = web3();
  return utils.toBN(first).add(utils.toBN(second));
};

module.exports = {
  getTransaction,
  getTransactionReceipt,
  sumBN,
};
