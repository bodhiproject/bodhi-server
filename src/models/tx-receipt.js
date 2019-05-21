/* eslint no-underscore-dangle: 0 */
const { isFinite, isString, isNull } = require('lodash');

module.exports = class TransactionReceipt {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.blockHash) && !isNull(params.blockHash)) {
      throw Error('blockHash must be a string|null');
    }
    if (!isFinite(params.blockNumber) && !isNull(params.blockNumber)) {
      throw Error('blockNumber must be a number|null');
    }
    if (!isString(params.transactionHash)) {
      throw Error('transactionHash must be a string');
    }
    if (!isString(params.from)) throw Error('from must be a string');
    if (!isString(params.to) && !isNull(params.to)) {
      throw Error('to must be a string|null');
    }
    if (!isFinite(params.cumulativeGasUsed)) {
      throw Error('cumulativeGasUsed must be a number');
    }
    if (!isFinite(params.gasUsed)) throw Error('gasUsed must be a number');
  }

  format(params) {
    this.status = params.status;
    this.blockHash = params.blockHash;
    this.blockNum = params.blockNumber;
    this.transactionHash = params.transactionHash;
    this.from = params.from;
    this.to = params.to;
    this.contractAddress = params.contractAddress;
    this.cumulativeGasUsed = params.cumulativeGasUsed;
    this.gasUsed = params.gasUsed;
    this.gasPrice = params.gasPrice;
  }
};
