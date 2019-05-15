/* eslint no-underscore-dangle: 0 */
const { isFinite, isString } = require('lodash');
const { TX_TYPE } = require('../constants');

module.exports = class Withdraw {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.txid)) throw Error('txid must be a String');
    if (!isString(params.txStatus)) throw Error('txStatus must be a String');
    if (!isFinite(params.blockNum)) throw Error('blockNum must be a Number');
  }

  format(params) {
    // Chain params
    this.txType = TX_TYPE.WITHDRAW;
    this.txid = params.txid;
    this.txStatus = params.txStatus;
    this.blockNum = Number(params.blockNum);

    // Withdraw params
    this.eventAddress = params.eventAddress;
    this.winnerAddress = params.winnerAddress;
    this.winningAmount = params.winningAmount.toString(10);
    this.escrowAmount = params.escrowAmount.toString(10);
  }
};
