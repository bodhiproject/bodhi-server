/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const Decoder = require('qweb3').Decoder;
const Web3Utils = require('web3-utils');

const { isMainnet } = require('../config');

class CentralizedOracle {
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
    this.contractAddress = this.rawLog._contractAddress;
    this.eventAddress = this.rawLog._eventAddress;
    this.oracle = Decoder.toQtumAddress(this.rawLog._oracle, isMainnet());
    this.numOfResults = this.rawLog._numOfResults.toNumber();
    this.bettingStartTime = this.rawLog._bettingStartTime.toNumber();
    this.bettingEndTime = this.rawLog._bettingEndTime.toNumber();
    this.resultSettingStartTime = this.rawLog._resultSettingStartTime.toNumber();
    this.resultSettingEndTime = this.rawLog._resultSettingEndTime.toNumber();
    this.consensusThreshold = Web3Utils.hexToNumberString(this.rawLog._consensusThreshold);
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      version: this.version,
      address: this.contractAddress,
      topicAddress: this.eventAddress,
      resultSetterAddress: this.oracle,
      resultSetterQAddress: this.oracle,
      startTime: this.bettingStartTime,
      endTime: this.bettingEndTime,
      resultSetStartTime: this.resultSettingStartTime,
      resultSetEndTime: this.resultSettingEndTime,
      consensusThreshold: this.consensusThreshold,
      name: null,
      options: null,
      optionIdxs: Array.from(Array(this.numOfResults).keys()),
      amounts: _.fill(Array(this.numOfResults), '0'),
      resultIdx: null,
      status: 'VOTING',
      token: 'QTUM',
      hashId: null,
    };
  }
}

module.exports = CentralizedOracle;
