const { isString } = require('lodash');
const BigNumber = require('bignumber.js');
const { toLowerCase } = require('../utils');

module.exports = class EventLeaderboard {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.userAddress)) throw Error('userAddress must be a String');
    if (!isString(params.eventAddress)) throw Error('eventAddress must be a String');
    if (!isString(params.investments)) throw Error('investments must be a String');
    if (!isString(params.winnings)) throw Error('winnings must be a String');
  }

  format(params) {
    this.eventAddress = toLowerCase(params.eventAddress);
    this.userAddress = toLowerCase(params.userAddress);
    this.investments = params.investments;
    this.winnings = params.winnings;
    const ratio = new BigNumber(this.winnings).dividedBy(new BigNumber(this.investments));
    this.returnRatio = ratio.toNumber();
  }
};
