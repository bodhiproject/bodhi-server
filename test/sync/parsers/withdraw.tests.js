const { assert } = require('chai');
const parseWithdraw = require('../../../src/sync/parsers/withdraw');
const { TX_STATUS } = require('../../../src/constants');

const log = {
  address: '0xdd2e163c2a7fe272a396b4a90ee7b1bd2a83ed83',
  topics: [
    '0x97263beea7d4a219c985fc740565fb86d4cddc960817b71d0bbc130551009797',
    '0x000000000000000000000000dd2e163c2a7fe272a396b4a90ee7b1bd2a83ed83',
    '0x000000000000000000000000bc4b8726f9619c871fad66030116964480205b9d',
  ],
  data: '0x000000000000000000000000000000000000000000000000000000004190ab000000000000000000000000000000000000000000000000000000000000000000',
  blockNumber: 3803127,
  blockHash: '0x8b0907ae988210f80d08db071146bb22873842f75270845870b505f793d226dc',
  transactionHash: '0x5ad29ce04995209d87e07b262e2346e1a4e855bd893973c3ff02d371ddc9b416',
  transactionIndex: 0,
  logIndex: 4,
};

describe('sync/parsers/withdraw', () => {
  it('parses the log', () => {
    const withdraw = parseWithdraw({ log });
    assert.equal(withdraw.txid, '0x5ad29ce04995209d87e07b262e2346e1a4e855bd893973c3ff02d371ddc9b416');
    assert.equal(withdraw.txStatus, TX_STATUS.SUCCESS);
    assert.equal(withdraw.blockNum, 3803127);
    assert.equal(withdraw.eventAddress, '0xdd2e163c2a7fe272a396b4a90ee7b1bd2a83ed83');
    assert.equal(withdraw.winnerAddress, '0xbc4b8726f9619c871fad66030116964480205b9d');
    assert.equal(withdraw.winningAmount, '1100000000');
    assert.equal(withdraw.escrowWithdrawAmount, '0');
  });
});
