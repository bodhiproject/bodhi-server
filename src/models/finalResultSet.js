/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const Decoder = require('qweb3').Decoder;

const { isMainnet } = require('../config');

class FinalResultSet {
  constructor(blockNum, txid, fromAddress, rawLog) {
    if (!_.isFinite(blockNum)) {
      throw Error('blockNum must be a Number');
    }
    if (!_.isString(txid)) {
      throw Error('txid must be a String');
    }
    if (!_.isString(fromAddress)) {
      throw Error('fromAddress must be a String');
    }
    if (_.isEmpty(rawLog)) {
      throw Error('rawLog must not be empty');
    }

    this.blockNum = blockNum;
    this.txid = txid;
    this.fromAddress = Decoder.toQtumAddress(fromAddress, isMainnet());
    this.rawLog = rawLog;
    this.decode();
  }

  decode() {
    this.version = this.rawLog._version.toNumber();
    this.eventAddress = this.rawLog._eventAddress;
    this.finalResultIndex = this.rawLog._finalResultIndex.toNumber();
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      fromAddress: this.fromAddress,
      version: this.version,
      topicAddress: this.eventAddress,
      oracleAddress: null,
      resultIdx: this.finalResultIndex,
    };
  }
}

module.exports = FinalResultSet;
