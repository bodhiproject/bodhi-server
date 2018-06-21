/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const { Decoder, Utils } = require('qweb3');
const Web3Utils = require('web3-utils');

const { isMainnet } = require('../config');

class Vote {
  constructor(blockNum, txid, rawLog) {
    if (!_.isFinite(blockNum)) {
      throw Error('blockNum must be a Number');
    }
    if (!_.isString(txid)) {
      throw Error('txid must be a String');
    }
    if (_.isEmpty(rawLog)) {
      throw Error('rawLog must not be empty');
    }

    this.blockNum = blockNum;
    this.txid = txid;
    this.rawLog = rawLog;
    this.decode();
  }

  decode() {
    this.version = this.rawLog._version.toNumber();
    this.oracleAddress = this.rawLog._oracleAddress;
    this.participant = Decoder.toQtumAddress(this.rawLog._participant, isMainnet());
    this.resultIndex = this.rawLog._resultIndex.toNumber();
    this.votedAmount = Web3Utils.hexToNumberString(this.rawLog._votedAmount);
    this.token = Utils.toUtf8(this.rawLog._token);
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      version: this.version,
      oracleAddress: this.oracleAddress,
      voterAddress: this.participant,
      voterQAddress: this.participant,
      optionIdx: this.resultIndex,
      amount: this.votedAmount,
      token: this.token,
      topicAddress: null,
    };
  }
}

module.exports = Vote;
