/* eslint no-underscore-dangle: 0 */
const { isFinite, isString } = require('lodash');

module.exports = class Bet {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isFinite(params.blockNum)) throw Error('blockNum must be a Number');
    if (!isString(params.txid)) throw Error('txid must be a String');
  }

  format(params) {
    // Chain params
    this.blockNum = params.blockNum;
    this.txid = params.txid;

    // Blockchain params
    this.eventAddress = params.eventAddress;
    this.betterAddress = params.betterAddress;
    this.resultIndex = params.resultIndex;
    this.amount = params.amount;
    this.eventRound = params.eventRound;
  }
};