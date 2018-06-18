/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const Decoder = require('qweb3').Decoder;

const { isMainnet } = require('../config');

class FinalResultSet {
  constructor(blockNum, txid, fromAddress, rawLog) {
    if (!_.isEmpty(rawLog)) {
      this.blockNum = blockNum;
      this.txid = txid;
      this.fromAddress = Decoder.toQtumAddress(fromAddress, isMainnet());
      this.rawLog = rawLog;
      this.decode();
    }
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
      resultIdx: this.finalResultIndex,
    };
  }
}

module.exports = FinalResultSet;
