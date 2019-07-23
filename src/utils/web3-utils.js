const { isNull, each } = require('lodash');
const web3 = require('../web3');
const TransactionReceipt = require('../models/tx-receipt');

/**
 * Returns a new contract instance given the ABI and address.
 * @param {object} abi Contract ABI
 * @param {string} address Contract address
 * @return {Contract} Web3 Contract instance
 */
const getContract = (abi, address) => new web3.eth.Contract(abi, address);

/**
 * Gets the pending tx and conforms it to the TransactionReceipt model.
 * @param {string} txid Transaction ID
 * @return {TransactionReceipt} Transaction receipt
 */
const getTransaction = async (txid) => {
  const tx = await web3.eth.getTransaction(txid);
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
  const receipt = await web3.eth.getTransactionReceipt(txid);
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
  const { utils } = web3;
  return utils.toBN(first).add(utils.toBN(second));
};

/**
 * Sums all the string numbers in the array.
 * @param {array} arr Array of string amounts to sum
 * @return {BN} BN instance
 */
const sumArrayBN = (arr) => {
  const { utils } = web3;
  let total = utils.toBN(0);
  each(arr, (num) => {
    total = total.add(utils.toBN(num));
  });
  return total;
};

module.exports = {
  getContract,
  getTransaction,
  getTransactionReceipt,
  sumBN,
  sumArrayBN,
};
