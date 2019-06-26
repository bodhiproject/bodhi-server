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

  /* Events */
  describe('test event db', () => {
    const mockEvent = [
      {"txType":"CREATE_EVENT","txid":"0xa47a223155ee3f9e1d313735547e7ad3e299d20992c0524f6b9694984100f7b0","txStatus":"SUCCESS","blockNum":4242848,"address":"0x60f243ed4a99e3309ef67d9486b9db14334bc6d4","ownerAddress":"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428","version":6,"name":"Test v6","results":["Invalid","1","2"],"numOfResults":3,"centralizedOracle":"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428","betStartTime":1561082467,"betEndTime":1561168846,"resultSetStartTime":1561168846,"resultSetEndTime":1561341646,"escrowAmount":"100000000","arbitrationLength":300,"thresholdPercentIncrease":"10","arbitrationRewardPercentage":10,"currentRound":0,"currentResultIndex":255,"consensusThreshold":"1000000000","arbitrationEndTime":0,"status":"OPEN_RESULT_SETTING","language":"zh-Hans-CN"},
      {"txType":"CREATE_EVENT","txid":"0xf0e68c3cfa4e77f0a5b46afd9f8c5efccd5d90f419053c6d452b021bc203c44f","txStatus":"SUCCESS","blockNum":3979339,"address":"0xfef4a675dba91b91608dc75c40deaca0333af514","ownerAddress":"0x47ba776b3ed5d514d3e206ffee72fa483baffa7e","version":5,"name":"QQQ","results":["Invalid","2","1"],"numOfResults":3,"centralizedOracle":"0x47ba776b3ed5d514d3e206ffee72fa483baffa7e","betStartTime":1560292822,"betEndTime":1560379222,"resultSetStartTime":1560379222,"resultSetEndTime":1560465622,"escrowAmount":"100000000","arbitrationLength":300,"thresholdPercentIncrease":"10","arbitrationRewardPercentage":10,"currentRound":0,"currentResultIndex":255,"consensusThreshold":"1000000000","arbitrationEndTime":0,"status":"OPEN_RESULT_SETTING","language":"en-US"},
      {"txType":"CREATE_EVENT","txid":"0x050497d3ed87c02246ba45ccd965f28e4194aace1167a25e46a2f6e29407d01c","txStatus":"SUCCESS","blockNum":3778535,"address":"0x80b35153213219ac3a3a3f28fe3cd3996518804a","ownerAddress":"0x939592864c0bd3355b2d54e4fa2203e8343b6d6a","version":4,"name":"test","results":["Invalid","1","2"],"numOfResults":3,"centralizedOracle":"0x939592864c0bd3355b2d54e4fa2203e8343b6d6a","betStartTime":1559689800,"betEndTime":1559691600,"resultSetStartTime":1559691600,"resultSetEndTime":1559863179,"escrowAmount":"100000000","arbitrationLength":86400,"thresholdPercentIncrease":"10","arbitrationRewardPercentage":10,"currentRound":0,"currentResultIndex":255,"consensusThreshold":"10000000000","arbitrationEndTime":0,"status":"OPEN_RESULT_SETTING","language":"zh-Hans-CN"}
    ]
    let eventCount;
    describe('find event', () => {
      it('find existed event', async () => {
        await DBHelper.insertEvent(mockEvent[0]);
        await DBHelper.insertEvent(mockEvent[1]);
        eventCount = await db.Events.count({});
        eventCount.should.equal(2);
        const foundEvents = await DBHelper.findEvent({}, { blockNum: -1});
        foundEvents.length.should.equal(2);
        expect(foundEvents[0]).excluding("_id").to.deep.equal(mockEvent[0]);
        expect(foundEvents[1]).excluding("_id").to.deep.equal(mockEvent[1]);
      })

      it('find non-existed event', async () => {
        const foundEvents = await DBHelper.findEvent({txid: '0x12344'}, { blockNum: -1});
        foundEvents.length.should.equal(0);
      })
    })

    describe('find one event', () => {
      it('find one existed event', async () => {
        const foundEvent = await DBHelper.findOneEvent({txid: mockEvent[0].txid});
        should.exist(foundEvent);
        expect(foundEvent).excluding("_id").to.deep.equal(mockEvent[0]);
      })

      it('find one non-existed event', async () => {
        const foundEvent = await DBHelper.findOneEvent({txid: '0x12344'});
        should.not.exist(foundEvent);
      })
    })

    describe('insert Event', () => {
      it('should insert new event', async () => {
        eventCount = await db.Events.count({});
        eventCount.should.equal(2);
        await DBHelper.insertEvent(mockEvent[2]);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        const event = await DBHelper.findOneEvent({txid: mockEvent[2].txid});
        should.exist(event);
        expect(event).excluding("_id").to.deep.equal(mockEvent[2]);
      })

      it('insert existed txid event', async () => {
        const newEventWithExistedTxid = {"txType":"CREATE_EVENT","txid":"0x050497d3ed87c02246ba45ccd965f28e4194aace1167a25e46a2f6e29407d01c","txStatus":"FAIL","blockNum":3728535,"address":"0x80b351543219ac3a3a3f28fe3cd3996518804a","ownerAddress":"0x939592432410bd3355b2d54e4fa2203e8343b6d6a","version":5,"name":"N","results":["Invalid","12","2"],"numOfResults":3,"centralizedOracle":"0x939592864c0b32d3355b2d15a2203e8343b6d6a","betStartTime":1559689700,"betEndTime":1559692600,"resultSetStartTime":1559692600,"resultSetEndTime":1559864179,"escrowAmount":"110000000","arbitrationLength":86400,"thresholdPercentIncrease":"10","arbitrationRewardPercentage":10,"currentRound":0,"currentResultIndex":255,"consensusThreshold":"10000000000","arbitrationEndTime":0,"status":"OPEN_RESULT_SETTING","language":"en-US"}
        await DBHelper.insertEvent(newEventWithExistedTxid);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        const event = await DBHelper.findOneEvent({txid: newEventWithExistedTxid.txid});
        should.exist(event);
        expect(event).excluding(["_id", "language"]).to.deep.equal(newEventWithExistedTxid);
        event.language.should.equal(mockEvent[2].language);
      })
    })

    describe('update event', () => {
      it('update event by txid', async () => {
        const updateNewEvent = {"txType":"CREATE_EVENT","txid":"0x050497d3ed87c02246ba45ccd965f28e4194aace1167a25e46a2f6e29407d01c","txStatus":"SUCCESS","blockNum":123442,"address":"0x382737120ad2323","ownerAddress":"0xea5854445251393b0e6f0a870799da15c003fc03","version":6,"name":"N","results":["Invalid","12","2"],"numOfResults":3,"centralizedOracle":"0x939592864c0b32d3355b2d15a2203e8343b6d6a","betStartTime":1559689700,"betEndTime":1559692600,"resultSetStartTime":1559692600,"resultSetEndTime":1559864179,"escrowAmount":"110000000","arbitrationLength":86400,"thresholdPercentIncrease":"10","arbitrationRewardPercentage":10,"currentRound":0,"currentResultIndex":255,"consensusThreshold":"10000000000","arbitrationEndTime":0,"status":"OPEN_RESULT_SETTING","language":"en-US"}
        let event = await DBHelper.findOneEvent({txid: mockEvent[2].txid});
        expect(event).excluding(["_id"]).to.deep.not.equal(updateNewEvent);
        await DBHelper.updateEvent(mockEvent[2].txid, updateNewEvent);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        event = await DBHelper.findOneEvent({txid: updateNewEvent.txid});
        should.exist(event);
        expect(event).excluding(["_id"]).to.deep.equal(updateNewEvent);
      })

      it('update event by address', async () => {
        let event = await DBHelper.findOneEvent({address: '0x382737120ad2323'});
        expect(event).excluding(["_id"]).to.deep.not.equal(mockEvent[2]);
        await DBHelper.updateEventByAddress("0x382737120ad2323", mockEvent[2]);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        event = await DBHelper.findOneEvent({txid: mockEvent[2].txid});
        should.exist(event);
        expect(event).excluding(["_id"]).to.deep.equal(mockEvent[2]);
      })
    })

  })

  after(async () => {
    fs.removeSync(getDbDir());
  });
});

