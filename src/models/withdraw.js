/* eslint no-underscore-dangle: 0 */
const { isString } = require('lodash');
const { TX_TYPE } = require('../constants');

module.exports = class Withdraw {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.txid)) throw Error('txid must be a String');
    if (!isString(params.txStatus)) throw Error('txStatus must be a String');
    if (!isString(params.eventAddress)) throw Error('eventAddress must be a String');
    if (!isString(params.winnerAddress)) throw Error('winnerAddress must be a String');
    if (!isString(params.winningAmount)) throw Error('winningAmount must be a String');
    if (!isString(params.escrowWithdrawAmount)) throw Error('escrowWithdrawAmount must be a String');
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
    this.escrowWithdrawAmount = params.escrowWithdrawAmount.toString(10);
  }
};
