/* eslint no-underscore-dangle: 0 */

const _ = require('lodash');

class OracleResultSet {
  constructor(blockNum, txid, fromAddress, rawLog) {
    if (!_.isEmpty(rawLog)) {
      this.blockNum = blockNum;
      this.txid = txid;
      this.fromAddress = fromAddress;
      this.rawLog = rawLog;
      this.decode();
    }
  }

  decode() {
    this.version = this.rawLog._version.toNumber();
    this.oracleAddress = this.rawLog._oracleAddress;
    this.resultIndex = this.rawLog._resultIndex.toNumber();
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      fromAddress: this.fromAddress,
      version: this.version,
      topicAddress: '',
      oracleAddress: this.oracleAddress,
      resultIdx: this.resultIndex,
    };
  }
}

module.exports = OracleResultSet;
