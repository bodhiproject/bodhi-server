const { assert } = require('chai');
const parseBet = require('../../../src/sync/parsers/bet');
const { TX_STATUS } = require('../../../src/constants');
const { equalIgnoreCase } = require('../../assert-utils');

const log = {
  address: '0xbbdfec793ef800769898795f469fc3951dc21eea',
  topics: [
    '0xe3d1fd0718455a4e70616f7c531752095dda6f41171af3e245535d0e39191982',
    '0x000000000000000000000000bbdfec793ef800769898795f469fc3951dc21eea',
    '0x0000000000000000000000007937a1e86f2cb43d6c91d27ca7a4f93c7f7189c3',
  ],
  data: '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000000',
  blockNumber: 3810125,
  blockHash: '0x8a46495f876af1d7e63e11bcb36d6a0bcc562770cc9ae810f9e7ef85442ca1cb',
  transactionHash: '0xe314e29163785d1361880588f252c039016943bf4de494b7ae0869fc9897fe13',
  transactionIndex: 0,
  logIndex: 2,
};

describe('sync/parsers/bet', () => {
  it('parses the log', () => {
    const bet = parseBet({ log });

    assert.isString(bet.txid);
    equalIgnoreCase(
      bet.txid,
      '0xe314e29163785d1361880588f252c039016943bf4de494b7ae0869fc9897fe13',
    );

    assert.isString(bet.txStatus);
    assert.equal(bet.txStatus, TX_STATUS.SUCCESS);

    assert.isNumber(bet.blockNum);
    assert.equal(bet.blockNum, 3810125);

    assert.isString(bet.eventAddress);
    equalIgnoreCase(bet.eventAddress, '0xbbdfec793ef800769898795f469fc3951dc21eea');

    assert.isString(bet.betterAddress);
    equalIgnoreCase(bet.betterAddress, '0x7937a1e86f2cb43d6c91d27ca7a4f93c7f7189c3');

    assert.isNumber(bet.resultIndex);
    assert.equal(bet.resultIndex, 1);

    assert.isString(bet.amount);
    assert.equal(bet.amount, '10000000');

    assert.isNumber(bet.eventRound);
    assert.equal(bet.eventRound, 0);
  });
});
