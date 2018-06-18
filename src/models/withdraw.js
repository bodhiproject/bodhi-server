/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const Decoder = require('qweb3').Decoder;
const Web3Utils = require('web3-utils');

const { isMainnet } = require('../config');
const { withdrawType } = require('../constants');

class Withdraw {
  constructor(blockNum, txid, contractAddress, rawLog, type) {
    if (!_.isFinite(blockNum)) {
      throw Error('blockNum must be a Number.');
    }
    if (!_.isString(txid)) {
      throw Error('txid must be a String.');
    }
    if (_.isEmpty(rawLog)) {
      throw Error('rawLog must not be empty.');
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
    this.version = this.rawLog._version.toNumber();
    this.winner = Decoder.toQtumAddress(this.rawLog._winner, isMainnet()),
    this.qtumTokenWon = Web3Utils.hexToNumberString(this.rawLog._qtumTokenWon);
    this.botTokenWon = Web3Utils.hexToNumberString(this.rawLog._botTokenWon);
  }

  translate() {
    return {
      blockNum: this.blockNum,
      txid: this.txid,
      version: this.version,
      type: this.type,
      topicAddress: this.contractAddress,
      winner: this.winner,
      qtumWon: this.qtumTokenWon,
      botWon: this.botTokenWon,
    };
  }
}

module.exports = Withdraw;
