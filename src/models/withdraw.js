/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const Decoder = require('qweb3').Decoder;
const Web3Utils = require('web3-utils');

const { isMainnet } = require('../config');
const { withdrawType } = require('../constants');

class Withdraw {
  constructor(blockNum, txid, contractAddress, rawLog, type) {
    if (!_.isFinite(blockNum)) {
      throw Error('blockNum must be a Number');
    }
    if (!_.isString(txid)) {
      throw Error('txid must be a String');
    }
    if (_.isEmpty(rawLog)) {
      throw Error('rawLog must not be empty');
    }
    if (type !== withdrawType.ESCROW && type !== withdrawType.WINNINGS) {
      throw Error(`Invalid escrow type: ${type}`);
    }

    this.blockNum = blockNum;
    this.txid = txid;
    this.contractAddress = contractAddress;
    this.rawLog = rawLog;
    this.type = type;
    this.decode();
  }

  decode() {
    switch (this.type) {
      case withdrawType.ESCROW: {
        this.topicAddress = this.rawLog._eventAddress;
        this.withdrawer = Decoder.toQtumAddress(this.rawLog._depositer, isMainnet());
        this.qtumAmount = '0';
        this.botAmount = Web3Utils.hexToNumberString(this.rawLog.escrowAmount);
        break;
      }
      case withdrawType.WINNINGS: {
        this.topicAddress = this.contractAddress;
        this.version = this.rawLog._version.toNumber();
        this.withdrawer = Decoder.toQtumAddress(this.rawLog._winner, isMainnet());
        this.qtumAmount = Web3Utils.hexToNumberString(this.rawLog._qtumTokenWon);
        this.botAmount = Web3Utils.hexToNumberString(this.rawLog._botTokenWon);
        break;
      }
      default: {
        throw Error(`Invalid escrow type: ${this.type}`);
      }
    }
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      version: this.version,
      type: this.type,
      topicAddress: this.topicAddress,
      withdrawer: this.withdrawer,
      qtumAmount: this.qtumAmount,
      botAmount: this.botAmount,
    };
  }
}

module.exports = Withdraw;
