/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const Decoder = require('qweb3').Decoder;
const Web3Utils = require('web3-utils');

const { isMainnet } = require('../config');

class WinningsWithdraw {
  constructor(blockNum, txid, contractAddress, rawLog) {
    if (!_.isEmpty(rawLog)) {
      this.blockNum = blockNum;
      this.txid = txid;
      this.contractAddress = contractAddress;
      this.rawLog = rawLog;
      this.decode();
    }
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
      topicAddress: this.contractAddress,
      winner: this.winner,
      qtumWon: this.qtumTokenWon,
      botWon: this.botTokenWon,
    };
  }
}

module.exports = WinningsWithdraw;
