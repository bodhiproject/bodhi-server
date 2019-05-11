const { isNull } = require('lodash');
const { web3 } = require('../web3');
const TransactionReceipt = require('../models/tx-receipt');
const { db } = require('../db');
const DBHelper = require('../db/db-helper');

module.exports = async (txid) => {
  try {
    const res = await web3().eth.getTransactionReceipt(txid);
    if (isNull(res)) throw Error(`txid ${txid} does not have tx receipt`);

    const txReceipt = new TransactionReceipt(res);
    await DBHelper.insertTxReceipt(db, txReceipt);
  } catch (err) {
    throw Error('Error getTransactionReceipt:', err);
  }
};
