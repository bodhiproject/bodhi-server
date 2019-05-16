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

module.exports = { getTransaction };
