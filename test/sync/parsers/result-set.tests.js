const { assert } = require('chai');
const parseResultSet = require('../../../src/sync/parsers/result-set');
const { TX_STATUS } = require('../../../src/constants');
const { equalIgnoreCase } = require('../../assert-utils');

const log = {
  address: '0x9d4768102f28af464355a46b839a06336bc64725',
  topics: [
    '0xc89c1df5e00bd75ca61515fdd2d9a287a9dcc585099975326451173f5aad6336',
    '0x0000000000000000000000009d4768102f28af464355a46b839a06336bc64725',
    '0x00000000000000000000000047ba776b3ed5d514d3e206ffee72fa483baffa7e',
  ],
  data: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002540be4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028fa6ae00000000000000000000000000000000000000000000000000000000005cf8079e',
  blockNumber: 3772813,
  blockHash: '0xac582f6518792807418b338a1686e59ad34c2fe4bc552b11965737ed5f4ff250',
  transactionHash: '0x869ab1d2f693a2c760834e9a74f18bd6fc33548b6b1d82cf08365ad8f541dbd0',
  transactionIndex: 0,
  logIndex: 2,
};

describe('sync/parsers/result-set', () => {
  it('parses the log', () => {
    const resultSet = parseResultSet({ log });

    assert.isString(resultSet.txid);
    equalIgnoreCase(
      resultSet.txid,
      '0x869ab1d2f693a2c760834e9a74f18bd6fc33548b6b1d82cf08365ad8f541dbd0',
    );

    assert.isString(resultSet.txStatus);
    assert.equal(resultSet.txStatus, TX_STATUS.SUCCESS);

    assert.isNumber(resultSet.blockNum);
    assert.equal(resultSet.blockNum, 3772813);

    assert.isString(resultSet.eventAddress);
    equalIgnoreCase(
      resultSet.eventAddress,
      '0x9d4768102f28af464355a46b839a06336bc64725',
    );

    assert.isString(resultSet.centralizedOracleAddress);
    equalIgnoreCase(
      resultSet.centralizedOracleAddress,
      '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
    );

    assert.isNumber(resultSet.resultIndex);
    assert.equal(resultSet.resultIndex, 0);

    assert.isString(resultSet.amount);
    assert.equal(resultSet.amount, '10000000000');

    assert.isNumber(resultSet.eventRound);
    assert.equal(resultSet.eventRound, 0);
  });
});
