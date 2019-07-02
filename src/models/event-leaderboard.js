/* eslint no-underscore-dangle: 0 */
const { isFinite, isString } = require('lodash');
const { toLowerCase } = require('../utils');

module.exports = class GlobalLeaderboard {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.userAddress)) throw Error('userAddress must be a String');
    if (!isString(params.eventAddress)) throw Error('eventAddress must be a String');
    if (!isString(params.investments)) throw Error('investments must be a Number');
    if (!isFinite(params.winnings)) throw Error('winnings must be a Number');
    if (!isString(params.returnRatio)) throw Error('returnRatio must be a Number');
  }

  format(params) {
    this.eventAddress = toLowerCase(params.eventAddress);
    this.userAddress = toLowerCase(params.userAddress);
    this.investments = params.investments;
    this.winnings = params.winnings;
    this.returnRatio = params.returnRatio;
  }
};
