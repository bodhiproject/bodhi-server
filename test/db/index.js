const chai = require('chai');
const chaiExclude = require('chai-exclude');

chai.use(chaiExclude);
const should = chai.should();
const { expect } = chai;
const fs = require('fs-extra');
const { initDB, db } = require('../../src/db');
const { getDbDir } = require('../../src/config');
const DBHelper = require('../../src/db/db-helper');

describe('db', () => {
  before(async () => {
    await initDB();
  });

  /* Blocks */
  describe('test block db', () => {
    describe('insert', () => {
      let blockCount;
      let blocks;
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
      it('find existed block in block db', async () => {
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedBlockTime);
        const block = await DBHelper.findOneBlock({ blockNum: toBeInsertedBlockNum });
        should.exist(block);
        block.blockNum.should.equal(toBeInsertedBlockNum);
        block.blockTime.should.equal(toBeInsertedBlockTime);
      });

      it('find non-existed block in block db', async () => {
        let block = await DBHelper.findOneBlock({ blockNum: -1 });
        should.not.exist(block);
        block = await DBHelper.findOneBlock({ blockNum: 123456789 });
        should.not.exist(block);
      });
    });
  });


  /* TransactionReceipts */
  describe('test transactionReceipts db', () => {
    let txReceiptsCount;
    let txReceipt;
    const toBeInsertedTxReceipt = {
      blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      blockNum: null,
      transactionHash: '0x81fcd2aec9f2f45a96eea6deb858a76fecce619df091f62ec92ec3bce6181d18',
      from: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
      to: '0x809388c8770c578cb87df1d1e84e3436d8156fda',
      cumulativeGasUsed: 500000,
      gasUsed: 500000,
      gasPrice: '47619047620',
    };
    const toBeInsertedExistedTxReceipt = {
      status: true,
      blockHash: '0x67be035531840561747a4c1bf9aa32a31641367ae1270db74cc321c9eb78e82f',
      blockNum: 4400858,
      transactionHash: '0x81fcd2aec9f2f45a96eea6deb858a76fecce619df091f62ec92ec3bce6181d18',
      from: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
      to: '0x809388c8770c578cb87df1d1e84e3436d8156fda',
      contractAddress: null,
      cumulativeGasUsed: 207559,
      gasUsed: 207559,
      gasPrice: '30000000',
    };
    describe('insert', () => {
      it('should start with empty transactionReceipts db', async () => {
        txReceiptsCount = await db.TransactionReceipts.count({});
        txReceiptsCount.should.equal(0);
      });

      it('should insert with new transaction receipt', async () => {
        await DBHelper.insertTransactionReceipt(toBeInsertedTxReceipt);
        txReceipt = await db.TransactionReceipts.find({});
        txReceipt.length.should.equal(1);
        expect(txReceipt[0]).excluding("_id").to.deep.equal(toBeInsertedTxReceipt)
      });

      it('should insert with existed transaction Hash', async () => {
        await DBHelper.insertTransactionReceipt(toBeInsertedExistedTxReceipt);
        txReceipt = await db.TransactionReceipts.find({});
        txReceipt.length.should.equal(1);
        expect(txReceipt[0]).excluding(["_id", "gasPrice"]).to.deep.equal(toBeInsertedExistedTxReceipt)
        txReceipt[0].gasPrice.should.equal(toBeInsertedTxReceipt.gasPrice);
      });
    });

    describe('find one transaction receipt', () => {
      it('should find existed transaction Hash', async () => {
        txReceipt = await DBHelper.findOneTransactionReceipt({transactionHash: toBeInsertedExistedTxReceipt.transactionHash});
        should.exist(txReceipt);
        expect(txReceipt).excluding(["_id", "gasPrice"]).to.deep.equal(toBeInsertedExistedTxReceipt)
        txReceipt.gasPrice.should.equal(toBeInsertedTxReceipt.gasPrice);
      })

      it('should not find non-existed transaction Hash', async () => {
        txReceipt = await DBHelper.findOneTransactionReceipt({transactionHash: 123321});
        should.not.exist(txReceipt)
      })
    })

    describe('update transaction receipt', () => {
      it('should update existed transaction Hash transaction receipt', async () => {
        const toBeUpdatedExistedTxReceipt = {
          status: true,
          blockHash: '0x67b323ds35531840561747a4c1bf9aa32a31641367ae1270db74cc321c9eb78e82f',
          blockNum: 143234534,
          transactionHash: '0x81fcd2aec9f2f45a96eea6deb858a76fecce619df091f62ec92ec3bce6181d18',
          from: '0x47ba776b3ed5230ffa7e',
          to: '0x809388c8770c578cb873o2399436d8156fda',
          contractAddress: '0x47ba776b3ed5230ffa7e',
          cumulativeGasUsed: 234359,
          gasUsed: 324432,
          gasPrice: '60000000',
        };
        await DBHelper.updateTransactionReceipt(toBeUpdatedExistedTxReceipt);
        txReceipt = await DBHelper.findOneTransactionReceipt({transactionHash: toBeUpdatedExistedTxReceipt.transactionHash});
        expect(txReceipt).excluding("_id").to.deep.equal(toBeUpdatedExistedTxReceipt)
      })
    })

    it('should fail update non-existed transaction Hash transaction receipt', async () => {
      const toBeUpdatedExistedTxReceipt = {
        status: true,
        blockHash: '0x67b323ds35531840561747a4c1bf9aa32a31641367ae1270db74cc321c9eb78e82f',
        blockNum: 143234534,
        transactionHash: '0xe619df091f62ec92ec3bce6181d18',
        from: '0x47ba776b3ed5230ffa7e',
        to: '0x809388c8770c578cb873o2399436d8156fda',
        contractAddress: '0x47ba776b3ed5230ffa7e',
        cumulativeGasUsed: 234359,
        gasUsed: 324432,
        gasPrice: '60000000',
      };
      await DBHelper.updateTransactionReceipt(toBeUpdatedExistedTxReceipt);
      txReceipt = await DBHelper.findOneTransactionReceipt({transactionHash: toBeUpdatedExistedTxReceipt.transactionHash});
      should.not.exist(txReceipt);
    })
  });

  after(async () => {
    fs.removeSync(getDbDir());
  });
});

