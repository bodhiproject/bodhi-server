const should = require('chai').should();
const fs = require('fs-extra');
const { initDB, db } = require('../../src/db');
const { getDbDir } = require('../../src/config');
const DBHelper = require('../../src/db/db-helper');

describe('db', () => {
  before(async () => {
    await initDB();
  });

  describe('test block db', () => {
    describe('insert', () => {
      let blockCount;
      const toBeInsertedBlockNum = 11111;
      const toBeInsertedBlockTime = Date.now();
      it('should start with empty block db', async () => {
        blockCount = await db.Blocks.count({});
        blockCount.should.equal(0);
      });

      it('should insert with new block num', async () => {
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedBlockTime);
        blocks = await db.Blocks.find({});
        blocks.length.should.equal(1);
        blocks[0].blockNum.should.equal(toBeInsertedBlockNum);
        blocks[0].blockTime.should.equal(toBeInsertedBlockTime);
      });

      it('should not insert with existed block num', async () => {
        const toBeInsertedFailBlockTime = Date.now();
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedFailBlockTime);
        blocks = await db.Blocks.find({});
        blocks.length.should.equal(1);
        blocks[0].blockNum.should.equal(toBeInsertedBlockNum);
        blocks[0].blockTime.should.equal(toBeInsertedBlockTime);
      });
    });

    describe('find latest block', () => {
      let blockCount;
      it('find latest on empty block db', async () => {
        db.Blocks.remove({}, { multi: true });
        blockCount = await db.Blocks.count({});
        blockCount.should.equal(0);
        const latestBlock = await DBHelper.findLatestBlock();
        latestBlock.length.should.equal(0);
      });

      it('find latest on non-empty block db', async () => {
        const latestBlockNum = 10000;
        const latestBlockTime = Date.now();
        await DBHelper.insertBlock(latestBlockNum, latestBlockTime);
        let latestBlock = await DBHelper.findLatestBlock();
        latestBlock[0].blockNum.should.equal(latestBlockNum);
        latestBlock[0].blockTime.should.equal(latestBlockTime);
        await DBHelper.insertBlock(latestBlockNum - 1000, latestBlockTime - 10000);
        latestBlock = await DBHelper.findLatestBlock();
        latestBlock[0].blockNum.should.equal(latestBlockNum);
        latestBlock[0].blockTime.should.equal(latestBlockTime);
      });
    });

    describe('find block', () => {
      const toBeInsertedBlockNum = 10001;
      const toBeInsertedBlockTime = Date.now();
      it('find exitsed block in block db', async () => {
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedBlockTime);
        const block = await DBHelper.findOneBlock({ blockNum: toBeInsertedBlockNum });
        should.exist(block);
        block.blockNum.should.equal(toBeInsertedBlockNum);
        block.blockTime.should.equal(toBeInsertedBlockTime);
      });

      it('find non-exitsed block in block db', async () => {
        const block = await DBHelper.findOneBlock({ blockNum: -1 });
        should.not.exist(block);
      });
    });
  });

  after(async () => {
    fs.removeSync(getDbDir());
  });
});

