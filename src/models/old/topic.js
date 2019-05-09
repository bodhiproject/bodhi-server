/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const { Decoder, Utils } = require('qweb3');

const { isMainnet } = require('../../config');

class Topic {
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
    this.topicAddress = this.rawLog._topicAddress;
    this.creatorAddress = Decoder.toQtumAddress(this.rawLog._creatorAddress, isMainnet());
    this.escrowAmount = this.rawLog._escrowAmount.toString(10);

    const nameHex = _.reduce(this.rawLog._name, (hexStr, value) => hexStr.concat(value), '');
    this.name = Utils.toUtf8(nameHex);

    const intermedia = _.map(this.rawLog._resultNames, item => Utils.toUtf8(item));
    this.resultNames = _.filter(intermedia, item => !!item);
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      version: this.version,
      address: this.topicAddress,
      creatorAddress: this.creatorAddress,
      escrowAmount: this.escrowAmount,
      name: this.name,
      options: this.resultNames,
      resultIdx: null,
      qtumAmount: _.fill(Array(this.resultNames.length), '0'),
      botAmount: _.fill(Array(this.resultNames.length), '0'),
      status: 'VOTING',
      hashId: null,
      language: 'zh-Hans-CN',
    };
  }
}

module.exports = Topic;
