const { isString, isFinite } = require('lodash');

class Transaction {
  constructor(args) {
    const { type, txid, status, createdBlock, createdTime, gasLimit, gasPrice, senderAddress } = args;
    if (!isString(type)) throw Error('type must be a string');
    if (!isString(txid)) throw Error('txid must be a string');
    if (!isString(status)) throw Error('status must be a string');
    if (!isFinite(createdTime)) throw Error('createdTime must be a number');
    if (!isFinite(createdBlock)) throw Error('createdBlock must be a number');
    if (!isString(gasLimit)) throw Error('gasLimit must be a string');
    if (!isString(gasPrice)) throw Error('gasPrice must be a string');
    if (!isString(senderAddress)) throw Error('senderAddress must be a string');
    Object.assign(this, args);
  }

  onConfirmed(status, blockNum, blockTime, gasUsed) {
    this.status = status;
    this.blockNum = blockNum;
    this.blockTime = blockTime;
    this.gasUsed = gasUsed;
  }
}

module.exports = Transaction;
