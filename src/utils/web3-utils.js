const { isNull, each } = require('lodash');
const web3 = require('../web3');
const TransactionReceipt = require('../models/tx-receipt');

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

/**
 * Manually parses a padded address to the 20 byte address.
 * @param {string} addr Padded address
 * @return {string} Non-padded address with hex prefix
 */
const parsePaddedAddress = (addr) => {
  if (addr.length !== 66 || addr.length !== 64) return addr;

  const { utils: { stripHexPrefix } } = web3;
  const adjusted = stripHexPrefix(addr);
  return `0x${adjusted.substr(24)}`;
};

module.exports = {
  getTransaction,
  getTransactionReceipt,
  sumBN,
  sumArrayBN,
  parsePaddedAddress,
};
