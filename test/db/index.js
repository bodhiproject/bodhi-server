const chai = require('chai');
const chaiExclude = require('chai-exclude');
const cryptoRandomString = require('crypto-random-string');

chai.use(chaiExclude);
const should = chai.should();
const { expect } = chai;
const fs = require('fs-extra');
const { initDB, db } = require('../../src/db');
const { getDbDir } = require('../../src/config');
const DBHelper = require('../../src/db/db-helper');
const { EVENT_STATUS, TX_STATUS } = require('../../src/constants');

function padHex(length) {
  let hexString = cryptoRandomString({ length });
  hexString = `0x${hexString}`;
  return hexString;
}

describe('db', () => {
  before(async () => {
    await initDB();
  });

  /* Blocks */
  describe('test block db', () => {
    describe('find latest block', () => {
      let blockCount;
      it('should return empty with an empty db', async () => {
        blockCount = await db.Blocks.count({});
        blockCount.should.equal(0);
        const latestBlock = await DBHelper.findLatestBlock();
        latestBlock.length.should.equal(0);
      });

      it('should return the latest block with a non-empty db', async () => {
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

    describe('insert', () => {
      let blockCount;
      let blocks;
      const toBeInsertedBlockNum = 11111;
      const toBeInsertedBlockTime = Date.now();

      it('should insert with new block num', async () => {
        blockCount = await db.Blocks.count({});
        blockCount.should.equal(2);
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedBlockTime);
        blockCount = await db.Blocks.count({});
        blockCount.should.equal(3);
        blocks = await db.Blocks.find({ blockNum: toBeInsertedBlockNum });
        blocks[0].blockNum.should.equal(toBeInsertedBlockNum);
        blocks[0].blockTime.should.equal(toBeInsertedBlockTime);
      });

      it('should not insert with existed block num', async () => {
        const toBeInsertedFailBlockTime = Date.now();
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedFailBlockTime);
        blockCount = await db.Blocks.count({});
        blockCount.should.equal(3);
        blocks = await db.Blocks.find({ blockNum: toBeInsertedBlockNum });
        blocks[0].blockNum.should.equal(toBeInsertedBlockNum);
        blocks[0].blockTime.should.equal(toBeInsertedBlockTime);
      });
    });

    describe('find block', () => {
      const toBeInsertedBlockNum = 10001;
      const toBeInsertedBlockTime = Date.now();
      it('finds the existing block by blockNum', async () => {
        await DBHelper.insertBlock(toBeInsertedBlockNum, toBeInsertedBlockTime);
        const block = await DBHelper.findOneBlock({ blockNum: toBeInsertedBlockNum });
        should.exist(block);
        block.blockNum.should.equal(toBeInsertedBlockNum);
        block.blockTime.should.equal(toBeInsertedBlockTime);
      });

      it('does not find the non-existing block by blockNum', async () => {
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
    const UnconfirmedTxReceipt = {
      blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      blockNum: null,
      transactionHash: '0x81fcd2aec9f2f45a96eea6deb858a76fecce619df091f62ec92ec3bce6181d18',
      from: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
      to: '0x809388c8770c578cb87df1d1e84e3436d8156fda',
      cumulativeGasUsed: 500000,
      gasUsed: 500000,
      gasPrice: '47619047620',
    };
    const confirmedTxReceipt = {
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
        await DBHelper.insertTransactionReceipt(UnconfirmedTxReceipt);
        txReceipt = await db.TransactionReceipts.find({});
        txReceipt.length.should.equal(1);
        expect(txReceipt[0]).excluding('_id').to.deep.equal(UnconfirmedTxReceipt);
      });

      it('should insert with existed transaction Hash', async () => {
        await DBHelper.insertTransactionReceipt(confirmedTxReceipt);
        txReceipt = await db.TransactionReceipts.find({});
        txReceipt.length.should.equal(1);
        expect(txReceipt[0]).excluding(['_id', 'gasPrice']).to.deep.equal(confirmedTxReceipt);
        txReceipt[0].gasPrice.should.equal(UnconfirmedTxReceipt.gasPrice);
      });
    });

    describe('find one transaction receipt', () => {
      it('should find existing tx receipt by transactionHash', async () => {
        txReceipt = await DBHelper.findOneTransactionReceipt({ transactionHash: confirmedTxReceipt.transactionHash });
        should.exist(txReceipt);
        expect(txReceipt).excluding(['_id', 'gasPrice']).to.deep.equal(confirmedTxReceipt);
        txReceipt.gasPrice.should.equal(UnconfirmedTxReceipt.gasPrice);
      });

      it('should not find non-existing tx receipt by transactionHash', async () => {
        txReceipt = await DBHelper.findOneTransactionReceipt({ transactionHash: 123321 });
        should.not.exist(txReceipt);
      });
    });

    describe('update transaction receipt', () => {
      it('should update existing tx receipt', async () => {
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
        txReceipt = await DBHelper.findOneTransactionReceipt({ transactionHash: toBeUpdatedExistedTxReceipt.transactionHash });
        expect(txReceipt).excluding('_id').to.deep.equal(toBeUpdatedExistedTxReceipt);
      });
    });

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
      txReceipt = await DBHelper.findOneTransactionReceipt({ transactionHash: toBeUpdatedExistedTxReceipt.transactionHash });
      should.not.exist(txReceipt);
    });
  });

  /* Events */
  describe('test event db', () => {
    const mockEvent = [
      {
        txType: 'CREATE_EVENT',
        txid: '0xa47a223155ee3f9e1d313735547e7ad3e299d20992c0524f6b9694984100f7b0',
        txStatus: 'SUCCESS',
        blockNum: 4242848,
        address: '0x60f243ed4a99e3309ef67d9486b9db14334bc6d4',
        ownerAddress: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        version: 6,
        name: 'Test v6',
        results: [
          'Invalid',
          '1',
          '2',
        ],
        numOfResults: 3,
        centralizedOracle: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        betStartTime: 1561082467,
        betEndTime: 1561168846,
        resultSetStartTime: 1561168846,
        resultSetEndTime: 1561341646,
        escrowAmount: '100000000',
        arbitrationLength: 300,
        thresholdPercentIncrease: '10',
        arbitrationRewardPercentage: 10,
        currentRound: 0,
        currentResultIndex: 255,
        consensusThreshold: '1000000000',
        arbitrationEndTime: 0,
        status: 'OPEN_RESULT_SETTING',
        language: 'zh-Hans-CN',
      },
      {
        txType: 'CREATE_EVENT',
        txid: '0xf0e68c3cfa4e77f0a5b46afd9f8c5efccd5d90f419053c6d452b021bc203c44f',
        txStatus: 'SUCCESS',
        blockNum: 3979339,
        address: '0xfef4a675dba91b91608dc75c40deaca0333af514',
        ownerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
        version: 5,
        name: 'QQQ',
        results: [
          'Invalid',
          '2',
          '1',
        ],
        numOfResults: 3,
        centralizedOracle: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
        betStartTime: 1560292822,
        betEndTime: 1560379222,
        resultSetStartTime: 1560379222,
        resultSetEndTime: 1560465622,
        escrowAmount: '100000000',
        arbitrationLength: 300,
        thresholdPercentIncrease: '10',
        arbitrationRewardPercentage: 10,
        currentRound: 0,
        currentResultIndex: 255,
        consensusThreshold: '1000000000',
        arbitrationEndTime: 0,
        status: 'OPEN_RESULT_SETTING',
        language: 'en-US',
      },
      {
        txType: 'CREATE_EVENT',
        txid: '0x050497d3ed87c02246ba45ccd965f28e4194aace1167a25e46a2f6e29407d01c',
        txStatus: 'SUCCESS',
        blockNum: 3778535,
        address: '0x80b35153213219ac3a3a3f28fe3cd3996518804a',
        ownerAddress: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
        version: 4,
        name: 'test',
        results: [
          'Invalid',
          '1',
          '2',
        ],
        numOfResults: 3,
        centralizedOracle: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
        betStartTime: 1559689800,
        betEndTime: 1559691600,
        resultSetStartTime: 1559691600,
        resultSetEndTime: 1559863179,
        escrowAmount: '100000000',
        arbitrationLength: 86400,
        thresholdPercentIncrease: '10',
        arbitrationRewardPercentage: 10,
        currentRound: 0,
        currentResultIndex: 255,
        consensusThreshold: '10000000000',
        arbitrationEndTime: 0,
        status: 'OPEN_RESULT_SETTING',
        language: 'zh-Hans-CN',
      },
    ];
    let eventCount;

    describe('find event', () => {
      it('should return existing events if passing sort', async () => {
        await DBHelper.insertEvent(mockEvent[0]);
        await DBHelper.insertEvent(mockEvent[1]);
        eventCount = await db.Events.count({});
        eventCount.should.equal(2);
        const foundEvents = await DBHelper.findEvent({}, { blockNum: -1 });
        foundEvents.length.should.equal(2);
        expect(foundEvents[0]).excluding('_id').to.deep.equal(mockEvent[0]);
        expect(foundEvents[1]).excluding('_id').to.deep.equal(mockEvent[1]);
      });

      it('should return empty find non-existing event if passing sort', async () => {
        const foundEvents = await DBHelper.findEvent({ txid: '0x12344' }, { blockNum: -1 });
        foundEvents.length.should.equal(0);
      });

      it('should return existing events if not passing sort', async () => {
        const foundEvents = await DBHelper.findEvent({ txid: mockEvent[0].txid });
        foundEvents.length.should.equal(1);
        expect(foundEvents[0]).excluding('_id').to.deep.equal(mockEvent[0]);
      });

      it('should return empty find non-existing event if not passing sort', async () => {
        const foundEvents = await DBHelper.findEvent({ txid: '0x12344' });
        foundEvents.length.should.equal(0);
      });
    });

    describe('find one event', () => {
      it('find one existed event', async () => {
        const foundEvent = await DBHelper.findOneEvent({ txid: mockEvent[0].txid });
        should.exist(foundEvent);
        expect(foundEvent).excluding('_id').to.deep.equal(mockEvent[0]);
      });

      it('find one non-existed event', async () => {
        const foundEvent = await DBHelper.findOneEvent({ txid: '0x12344' });
        should.not.exist(foundEvent);
      });
    });

    describe('insert Event', () => {
      it('should insert new event', async () => {
        eventCount = await db.Events.count({});
        eventCount.should.equal(2);
        await DBHelper.insertEvent(mockEvent[2]);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        const event = await DBHelper.findOneEvent({ txid: mockEvent[2].txid });
        should.exist(event);
        expect(event).excluding('_id').to.deep.equal(mockEvent[2]);
      });

      it('insert existed txid event', async () => {
        const newEventWithExistedTxid = {
          txType: 'CREATE_EVENT',
          txid: '0x050497d3ed87c02246ba45ccd965f28e4194aace1167a25e46a2f6e29407d01c',
          txStatus: 'FAIL',
          blockNum: 3728535,
          address: '0x939592432410bd335521454e4fa2203e8343b6d6a',
          ownerAddress: '0x939592432410bd3355b2d54e4fa2203e8343b6d6a',
          version: 5,
          name: 'N',
          results: [
            'Invalid',
            '12',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x939592864c0b32d3355b2d15a2203e8343b6d6a',
          betStartTime: 1559689700,
          betEndTime: 1559692600,
          resultSetStartTime: 1559692600,
          resultSetEndTime: 1559864179,
          escrowAmount: '110000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'OPEN_RESULT_SETTING',
          language: 'en-US',
        };
        await DBHelper.insertEvent(newEventWithExistedTxid);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        const event = await DBHelper.findOneEvent({ txid: newEventWithExistedTxid.txid });
        should.exist(event);
        expect(event).excluding(['_id', 'language']).to.deep.equal(newEventWithExistedTxid);
        event.language.should.equal(mockEvent[2].language);
      });
    });

    describe('update event', () => {
      it('update event by txid', async () => {
        const updateNewEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x050497d3ed87c02246ba45ccd965f28e4194aace1167a25e46a2f6e29407d01c',
          txStatus: 'SUCCESS',
          blockNum: 123442,
          address: '0x0c97ba43149c1232920ef1e9d410316905c1ce8a',
          ownerAddress: '0xea5854445251393b0e6f0a870799da15c003fc03',
          version: 6,
          name: 'N',
          results: [
            'Invalid',
            '12',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x939592864c0b32d3355b2d15a2203e8343b6d6a',
          betStartTime: 1559689700,
          betEndTime: 1559692600,
          resultSetStartTime: 1559692600,
          resultSetEndTime: 1559864179,
          escrowAmount: '110000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'OPEN_RESULT_SETTING',
          language: 'en-US',
        };
        let event = await DBHelper.findOneEvent({ txid: mockEvent[2].txid });
        expect(event).excluding(['_id']).to.deep.not.equal(updateNewEvent);
        await DBHelper.updateEvent(mockEvent[2].txid, updateNewEvent);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        event = await DBHelper.findOneEvent({ txid: updateNewEvent.txid });
        should.exist(event);
        expect(event).excluding(['_id']).to.deep.equal(updateNewEvent);
      });

      it('update event by address', async () => {
        let event = await DBHelper.findOneEvent({ address: '0x0c97ba43149c1232920ef1e9d410316905c1ce8a' });
        expect(event).excluding(['_id']).to.deep.not.equal(mockEvent[2]);
        await DBHelper.updateEventByAddress('0x0c97ba43149c1232920ef1e9d410316905c1ce8a', mockEvent[2]);
        eventCount = await db.Events.count({});
        eventCount.should.equal(3);
        event = await DBHelper.findOneEvent({ txid: mockEvent[2].txid });
        should.exist(event);
        expect(event).excluding(['_id']).to.deep.equal(mockEvent[2]);
      });
    });

    describe('event status update', () => {
      let event;

      describe('update event status to PRE_BETTING', () => {
        const mockCreatedStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x1628812210d8e7d071ee343ece4d79c248191fdf76938cecd572158c475cb7f5',
          txStatus: 'SUCCESS',
          blockNum: 4404133,
          address: '0x1c97ba43149c6eee920ef1e9d410316905c1ce8a',
          ownerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          version: 6,
          name: 'TEST EVENT STATUS',
          results: [
            'Invalid',
            '1',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          betStartTime: 1561585230,
          betEndTime: 1561671614,
          resultSetStartTime: 1561671714,
          resultSetEndTime: 1561844414,
          escrowAmount: '100000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'CREATED',
          language: 'en-US',
          withdrawnList: [
          ],
        };
        it('should not update event status to PRE_BETTING if txStatus is FAIL', async () => {
          const createdEvent = {};
          Object.assign(createdEvent, mockCreatedStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(createdEvent);
          await DBHelper.updateEventStatusPreBetting(createdEvent.betStartTime - 1);
          event = await DBHelper.findEvent({ address: createdEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(createdEvent);
        });

        it('should not update event status to PRE_BETTING if txStatus is PENDING', async () => {
          const createdEvent = {};
          Object.assign(createdEvent, mockCreatedStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(createdEvent);
          await DBHelper.updateEventStatusPreBetting(createdEvent.betStartTime - 1);
          event = await DBHelper.findEvent({ address: createdEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(createdEvent);
        });

        it('should not update event already in PRE_BETTING to PRE_BETTING', async () => {
          const createdEvent = {};
          Object.assign(createdEvent, mockCreatedStatusEvent, { status: EVENT_STATUS.PRE_BETTING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(createdEvent);
          await DBHelper.updateEventStatusPreBetting(createdEvent.betStartTime - 1);
          event = await DBHelper.findEvent({ address: createdEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(createdEvent);
        });

        it('should update event status to PRE_BETTING if currBlockTime < betStartTime', async () => {
          const createdEvent = {};
          Object.assign(createdEvent, mockCreatedStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(createdEvent);
          await DBHelper.updateEventStatusPreBetting(createdEvent.betStartTime - 1);
          event = await DBHelper.findEvent({ address: createdEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(createdEvent);
          event[0].status.should.equal(EVENT_STATUS.PRE_BETTING);
        });

        it('should not update event status to PRE_BETTING if currBlockTime = betStartTime', async () => {
          const createdEvent = {};
          Object.assign(createdEvent, mockCreatedStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(createdEvent);
          await DBHelper.updateEventStatusPreBetting(createdEvent.betStartTime);
          event = await DBHelper.findEvent({ address: createdEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(createdEvent);
        });

        it('should not update event status to PRE_BETTING if currentRound > 0', async () => {
          const createdEvent = {};
          Object.assign(createdEvent, mockCreatedStatusEvent, { currentRound: 1, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(createdEvent);
          await DBHelper.updateEventStatusPreBetting(createdEvent.betStartTime - 1);
          event = await DBHelper.findEvent({ address: createdEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(createdEvent);
        });
      });

      // BETTING
      describe('update event status to BETTING', () => {
        const mockPreBettingStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x1628812210d8e7d071ee343ece4d79c248191fdf76938cecd572158c475cb7f5',
          txStatus: 'SUCCESS',
          blockNum: 4404133,
          address: '0x1c97ba43149c6eee920ef1e9d410316905c1ce8a',
          ownerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          version: 6,
          name: 'TEST EVENT STATUS',
          results: [
            'Invalid',
            '1',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          betStartTime: 1561585230,
          betEndTime: 1561671614,
          resultSetStartTime: 1561671714,
          resultSetEndTime: 1561844414,
          escrowAmount: '100000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'PRE_BETTING',
          language: 'en-US',
          withdrawnList: [
          ],
        };


        it('should not update event status to BETTING if txStatus is FAIL', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betStartTime);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preBetEvent);
        });

        it('should not update event status to BETTING if txStatus is PENDING', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betStartTime);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preBetEvent);
        });

        it('should not update event status to BETTING if status is already BETTING', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { status: EVENT_STATUS.BETTING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betStartTime);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preBetEvent);
        });

        it('should not update event status to BETTING if currBlockTime < betStartTime', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betStartTime - 1);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preBetEvent);
        });

        it('should update event status to BETTING if currBlockTime = betStartTime', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betStartTime);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(preBetEvent);
          event[0].status.should.equal(EVENT_STATUS.BETTING);
        });

        it('should update event status to BETTING if currBlockTime = betEndTime - 1', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betEndTime - 1);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(preBetEvent);
          event[0].status.should.equal(EVENT_STATUS.BETTING);
        });

        it('should not update event status to BETTING if currBlockTime = betEndTime', async () => {
          const preBetEvent = {};
          Object.assign(preBetEvent, mockPreBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preBetEvent);
          await DBHelper.updateEventStatusBetting(preBetEvent.betEndTime);
          event = await DBHelper.findEvent({ address: preBetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preBetEvent);
        });
      });

      // PRE_RESULT_SETTING
      describe('update event status to PRE_RESULT_SETTING', () => {
        const mockBettingStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x1628812210d8e7d071ee343ece4d79c248191fdf76938cecd572158c475cb7f5',
          txStatus: 'SUCCESS',
          blockNum: 4404133,
          address: '0x1c97ba43149c6eee920ef1e9d410316905c1ce8a',
          ownerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          version: 6,
          name: 'TEST EVENT STATUS',
          results: [
            'Invalid',
            '1',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          betStartTime: 1561585230,
          betEndTime: 1561671614,
          resultSetStartTime: 1561671714,
          resultSetEndTime: 1561844414,
          escrowAmount: '100000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'BETTING',
          language: 'en-US',
          withdrawnList: [
          ],
        };

        it('should not update event status to PRE_RESULT_SETTING if txStatus is FAIL', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.betEndTime);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(betEvent);
        });

        it('should not update event status to PRE_RESULT_SETTING if txStatus is PENDING', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.betEndTime);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(betEvent);
        });

        it('should not update event status to PRE_RESULT_SETTING if status is already PRE_RESULT_SETTING', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { status: EVENT_STATUS.PRE_RESULT_SETTING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.betEndTime);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(betEvent);
        });

        it('should not update event status to PRE_RESULT_SETTING if currBlockTime < betEndTime', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.betEndTime - 1);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(betEvent);
        });

        it('should update event status to PRE_RESULT_SETTING if currBlockTime = betEndTime', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.betEndTime);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(betEvent);
          event[0].status.should.equal(EVENT_STATUS.PRE_RESULT_SETTING);
        });

        it('should update event status to PRE_RESULT_SETTING if currBlockTime = resultSetStartTime - 1', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.resultSetStartTime - 1);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(betEvent);
          event[0].status.should.equal(EVENT_STATUS.PRE_RESULT_SETTING);
        });

        it('should not update event status to PRE_RESULT_SETTING if currBlockTime = resultSetStartTime', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.resultSetStartTime);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(betEvent);
        });

        it('should not update event status to PRE_RESULT_SETTING if currentRound > 0', async () => {
          const betEvent = {};
          Object.assign(betEvent, mockBettingStatusEvent, { currentRound: 1, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(betEvent);
          await DBHelper.updateEventStatusPreResultSetting(betEvent.resultSetStartTime - 1);
          event = await DBHelper.findEvent({ address: betEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(betEvent);
        });
      });

      // ORACLE_RESULT_SETTING
      describe('update event status to ORACLE_RESULT_SETTING', () => {
        const mockPreResultSettingStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x1628812210d8e7d071ee343ece4d79c248191fdf76938cecd572158c475cb7f5',
          txStatus: 'SUCCESS',
          blockNum: 4404133,
          address: '0x1c97ba43149c6eee920ef1e9d410316905c1ce8a',
          ownerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          version: 6,
          name: 'TEST EVENT STATUS',
          results: [
            'Invalid',
            '1',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          betStartTime: 1561585230,
          betEndTime: 1561671614,
          resultSetStartTime: 1561671714,
          resultSetEndTime: 1561844414,
          escrowAmount: '100000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'PRE_RESULT_SETTING',
          language: 'en-US',
          withdrawnList: [
          ],
        };

        it('should not update event status to ORACLE_RESULT_SETTING if txStatus is FAIL', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetStartTime);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preResultSetEvent);
        });

        it('should not update event status to ORACLE_RESULT_SETTING if txStatus is PENDING', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetStartTime);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preResultSetEvent);
        });

        it('should not update event status to ORACLE_RESULT_SETTING if status is already ORACLE_RESULT_SETTING', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { status: EVENT_STATUS.ORACLE_RESULT_SETTING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetStartTime);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preResultSetEvent);
        });

        it('should not update event status to ORACLE_RESULT_SETTING if currBlockTime < resultSetStartTime', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetStartTime - 1);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preResultSetEvent);
        });

        it('should update event status to ORACLE_RESULT_SETTING if currBlockTime = resultSetStartTime', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetStartTime);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(preResultSetEvent);
          event[0].status.should.equal(EVENT_STATUS.ORACLE_RESULT_SETTING);
        });

        it('should update event status to ORACLE_RESULT_SETTING if currBlockTime = resultSetEndTime - 1', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetEndTime - 1);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(preResultSetEvent);
          event[0].status.should.equal(EVENT_STATUS.ORACLE_RESULT_SETTING);
        });

        it('should not update event status to ORACLE_RESULT_SETTING if currBlockTime = resultSetEndTime', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetEndTime);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preResultSetEvent);
        });

        it('should not update event status to ORACLE_RESULT_SETTING if currentRound > 0', async () => {
          const preResultSetEvent = {};
          Object.assign(preResultSetEvent, mockPreResultSettingStatusEvent, { currentRound: 1, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(preResultSetEvent);
          await DBHelper.updateEventStatusOracleResultSetting(preResultSetEvent.resultSetEndTime - 1);
          event = await DBHelper.findEvent({ address: preResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(preResultSetEvent);
        });
      });

      // OPEN_RESULT_SETTING
      describe('update event status to OPEN_RESULT_SETTING', () => {
        const mockOracleResultSettingStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x1628812210d8e7d071ee343ece4d79c248191fdf76938cecd572158c475cb7f5',
          txStatus: 'SUCCESS',
          blockNum: 4404133,
          address: '0x1c97ba43149c6eee920ef1e9d410316905c1ce8a',
          ownerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          version: 6,
          name: 'TEST EVENT STATUS',
          results: [
            'Invalid',
            '1',
            '2',
          ],
          numOfResults: 3,
          centralizedOracle: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          betStartTime: 1561585230,
          betEndTime: 1561671614,
          resultSetStartTime: 1561671714,
          resultSetEndTime: 1561844414,
          escrowAmount: '100000000',
          arbitrationLength: 86400,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 0,
          currentResultIndex: 255,
          consensusThreshold: '10000000000',
          arbitrationEndTime: 0,
          status: 'ORACLE_RESULT_SETTING',
          language: 'en-US',
          withdrawnList: [
          ],
        };

        it('should not update event status to OPEN_RESULT_SETTING if txStatus is FAIL', async () => {
          const oracleResultSetEvent = {};
          Object.assign(oracleResultSetEvent, mockOracleResultSettingStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(oracleResultSetEvent);
          await DBHelper.updateEventStatusOpenResultSetting(oracleResultSetEvent.resultSetEndTime);
          event = await DBHelper.findEvent({ address: oracleResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(oracleResultSetEvent);
        });

        it('should not update event status to OPEN_RESULT_SETTING if txStatus is PENDING', async () => {
          const oracleResultSetEvent = {};
          Object.assign(oracleResultSetEvent, mockOracleResultSettingStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(oracleResultSetEvent);
          await DBHelper.updateEventStatusOpenResultSetting(oracleResultSetEvent.resultSetEndTime);
          event = await DBHelper.findEvent({ address: oracleResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(oracleResultSetEvent);
        });

        it('should not update event status to OPEN_RESULT_SETTING if status is already OPEN_RESULT_SETTING', async () => {
          const oracleResultSetEvent = {};
          Object.assign(oracleResultSetEvent, mockOracleResultSettingStatusEvent, { status: EVENT_STATUS.OPEN_RESULT_SETTING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(oracleResultSetEvent);
          await DBHelper.updateEventStatusOpenResultSetting(oracleResultSetEvent.resultSetEndTime);
          event = await DBHelper.findEvent({ address: oracleResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(oracleResultSetEvent);
        });

        it('should not update event status to OPEN_RESULT_SETTING if currBlockTime < resultSetEndTime', async () => {
          const oracleResultSetEvent = {};
          Object.assign(oracleResultSetEvent, mockOracleResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(oracleResultSetEvent);
          await DBHelper.updateEventStatusOpenResultSetting(oracleResultSetEvent.resultSetEndTime - 1);
          event = await DBHelper.findEvent({ address: oracleResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(oracleResultSetEvent);
        });

        it('should update event status to OPEN_RESULT_SETTING if currBlockTime = resultSetEndTime', async () => {
          const oracleResultSetEvent = {};
          Object.assign(oracleResultSetEvent, mockOracleResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(oracleResultSetEvent);
          await DBHelper.updateEventStatusOpenResultSetting(oracleResultSetEvent.resultSetEndTime);
          event = await DBHelper.findEvent({ address: oracleResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(oracleResultSetEvent);
          event[0].status.should.equal(EVENT_STATUS.OPEN_RESULT_SETTING);
        });

        it('should not update event status to OPEN_RESULT_SETTING if currentRound > 0', async () => {
          const oracleResultSetEvent = {};
          Object.assign(oracleResultSetEvent, mockOracleResultSettingStatusEvent, { currentRound: 1, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(oracleResultSetEvent);
          await DBHelper.updateEventStatusOpenResultSetting(oracleResultSetEvent.resultSetEndTime);
          event = await DBHelper.findEvent({ address: oracleResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(oracleResultSetEvent);
        });
      });

      // ARBITRATION
      describe('update event status to ARBITRATION', () => {
        const mockOpenResultSettingStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x2cb3d96ace9686a6f46cdab0c8e6a270e7658e3f50a2299e89b7f338b28032f8',
          txStatus: 'SUCCESS',
          blockNum: 3946349,
          address: '0x39449d9fc354ebbdf85e92edbaa8eb4f93e3e782',
          ownerAddress: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
          version: 5,
          name: 'zx',
          results: [
            'Invalid',
            'as',
            'qw',
          ],
          numOfResults: 3,
          centralizedOracle: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
          betStartTime: 1560193842,
          betEndTime: 1560280242,
          resultSetStartTime: 1560280242,
          resultSetEndTime: 1560366642,
          escrowAmount: '100000000',
          arbitrationLength: 300,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 1,
          currentResultIndex: 2,
          consensusThreshold: '1100000000',
          arbitrationEndTime: 1561679412,
          status: 'OPEN_RESULT_SETTING',
          language: 'zh-Hans-CN',
        };

        it('should not update event status to ARBITRATION if txStatus is FAIL', async () => {
          const openResultSetEvent = {};
          Object.assign(openResultSetEvent, mockOpenResultSettingStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(openResultSetEvent);
          await DBHelper.updateEventStatusArbitration(openResultSetEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: openResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(openResultSetEvent);
        });

        it('should not update event status to ARBITRATION if txStatus is PENDING', async () => {
          const openResultSetEvent = {};
          Object.assign(openResultSetEvent, mockOpenResultSettingStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(openResultSetEvent);
          await DBHelper.updateEventStatusArbitration(openResultSetEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: openResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(openResultSetEvent);
        });

        it('should not update event status to ARBITRATION if status is already ARBITRATION', async () => {
          const openResultSetEvent = {};
          Object.assign(openResultSetEvent, mockOpenResultSettingStatusEvent, { status: EVENT_STATUS.ARBITRATION, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(openResultSetEvent);
          await DBHelper.updateEventStatusArbitration(openResultSetEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: openResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(openResultSetEvent);
        });

        it('should update event status to ARBITRATION if currBlockTime < arbitrationEndTime', async () => {
          const openResultSetEvent = {};
          Object.assign(openResultSetEvent, mockOpenResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(openResultSetEvent);
          await DBHelper.updateEventStatusArbitration(openResultSetEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: openResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(openResultSetEvent);
          event[0].status.should.equal(EVENT_STATUS.ARBITRATION);
        });

        it('should not update event status to ARBITRATION if currBlockTime = arbitrationEndTime', async () => {
          const openResultSetEvent = {};
          Object.assign(openResultSetEvent, mockOpenResultSettingStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(openResultSetEvent);
          await DBHelper.updateEventStatusArbitration(openResultSetEvent.arbitrationEndTime);
          event = await DBHelper.findEvent({ address: openResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(openResultSetEvent);
        });

        it('should not update event status to ARBITRATION if currentRound = 0', async () => {
          const openResultSetEvent = {};
          Object.assign(openResultSetEvent, mockOpenResultSettingStatusEvent, { currentRound: 0, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(openResultSetEvent);
          await DBHelper.updateEventStatusArbitration(openResultSetEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: openResultSetEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(openResultSetEvent);
        });
      });

      // WITHDRAWING
      describe('update event status to WITHDRAWING', () => {
        const mockArbitrationStatusEvent = {
          txType: 'CREATE_EVENT',
          txid: '0x2cb3d96ace9686a6f46cdab0c8e6a270e7658e3f50a2299e89b7f338b28032f8',
          txStatus: 'SUCCESS',
          blockNum: 3946349,
          address: '0x39449d9fc354ebbdf85e92edbaa8eb4f93e3e782',
          ownerAddress: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
          version: 5,
          name: 'zx',
          results: [
            'Invalid',
            'as',
            'qw',
          ],
          numOfResults: 3,
          centralizedOracle: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
          betStartTime: 1560193842,
          betEndTime: 1560280242,
          resultSetStartTime: 1560280242,
          resultSetEndTime: 1560366642,
          escrowAmount: '100000000',
          arbitrationLength: 300,
          thresholdPercentIncrease: '10',
          arbitrationRewardPercentage: 10,
          currentRound: 1,
          currentResultIndex: 2,
          consensusThreshold: '1100000000',
          arbitrationEndTime: 1561679412,
          status: 'OPEN_RESULT_SETTING',
          language: 'zh-Hans-CN',
        };

        it('should not update event status to WITHDRAWING if txStatus is FAIL', async () => {
          const arbitrationEvent = {};
          Object.assign(arbitrationEvent, mockArbitrationStatusEvent, { txStatus: TX_STATUS.FAIL, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(arbitrationEvent);
          await DBHelper.updateEventStatusWithdrawing(arbitrationEvent.arbitrationEndTime);
          event = await DBHelper.findEvent({ address: arbitrationEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(arbitrationEvent);
        });

        it('should not update event status to WITHDRAWING if txStatus is PENDING', async () => {
          const arbitrationEvent = {};
          Object.assign(arbitrationEvent, mockArbitrationStatusEvent, { txStatus: TX_STATUS.PENDING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(arbitrationEvent);
          await DBHelper.updateEventStatusWithdrawing(arbitrationEvent.arbitrationEndTime);
          event = await DBHelper.findEvent({ address: arbitrationEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(arbitrationEvent);
        });

        it('should not update event status to WITHDRAWING if status is already WITHDRAWING', async () => {
          const arbitrationEvent = {};
          Object.assign(arbitrationEvent, mockArbitrationStatusEvent, { status: EVENT_STATUS.WITHDRAWING, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(arbitrationEvent);
          await DBHelper.updateEventStatusWithdrawing(arbitrationEvent.arbitrationEndTime);
          event = await DBHelper.findEvent({ address: arbitrationEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(arbitrationEvent);
        });

        it('should not update event status to WITHDRAWING if currBlockTime < arbitrationEndTime', async () => {
          const arbitrationEvent = {};
          Object.assign(arbitrationEvent, mockArbitrationStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(arbitrationEvent);
          await DBHelper.updateEventStatusWithdrawing(arbitrationEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: arbitrationEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(arbitrationEvent);
        });

        it('should update event status to WITHDRAWING if currBlockTime = arbitrationEndTime', async () => {
          const arbitrationEvent = {};
          Object.assign(arbitrationEvent, mockArbitrationStatusEvent, { address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(arbitrationEvent);
          await DBHelper.updateEventStatusWithdrawing(arbitrationEvent.arbitrationEndTime);
          event = await DBHelper.findEvent({ address: arbitrationEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id', 'status']).to.deep.equal(arbitrationEvent);
          event[0].status.should.equal(EVENT_STATUS.WITHDRAWING);
        });

        it('should not update event status to WITHDRAWING if currentRound = 0', async () => {
          const arbitrationEvent = {};
          Object.assign(arbitrationEvent, mockArbitrationStatusEvent, { currentRound: 0, address: padHex(40), txid: padHex(64) });
          await DBHelper.insertEvent(arbitrationEvent);
          await DBHelper.updateEventStatusWithdrawing(arbitrationEvent.arbitrationEndTime - 1);
          event = await DBHelper.findEvent({ address: arbitrationEvent.address });
          event.length.should.equal(1);
          expect(event[0]).excluding(['_id']).to.deep.equal(arbitrationEvent);
        });
      });

      describe('test event withdrawn list', () => {
        const withdraw = {
          eventAddress: '0xfef4a675dba91b91608dc75c40deaca0333af514',
          winnerAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
        };
        it('should update event withdrawnlist', async () => {
          await DBHelper.updateEventWithdrawnList(withdraw);
          event = await DBHelper.findOneEvent({ address: withdraw.eventAddress });
          event.withdrawnList[0].should.equal(withdraw.winnerAddress);
        });
        it('does not add to withdrawnList if already on the list', async () => {
          const old = await DBHelper.findOneEvent({ address: withdraw.eventAddress });
          await DBHelper.updateEventWithdrawnList(withdraw);
          event = await DBHelper.findOneEvent({ address: withdraw.eventAddress });
          expect(event).excluding(['_id']).to.deep.equal(old);
        });
      });
    });
  });

  /* Bets */
  describe('test bets db', () => {
    const mockBets = [
      {
        txType: 'BET',
        txid: '0x445ffdcfb4b3e30c3c8d73a7583230b60eff51054035389df7cf187f5d3f75b6',
        txStatus: 'SUCCESS',
        blockNum: 4154205,
        eventAddress: '0xbeaa4358aa4434227c4545544e50c1b1a52a51c6',
        betterAddress: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
        resultIndex: 2,
        amount: '1100000000',
        eventRound: 0,
      },
      {
        txType: 'BET',
        txid: '0xe314e29163785d1361880588f252c039016943bf4de494b7ae0869fc9897fe13',
        txStatus: 'SUCCESS',
        blockNum: 3810125,
        eventAddress: '0xbbdfec793ef800769898795f469fc3951dc21eea',
        betterAddress: '0x7937a1e86f2cb43d6c91d27ca7a4f93c7f7189c3',
        resultIndex: 1,
        amount: '10000000',
        eventRound: 0,
      },
      {
        txType: 'BET',
        txid: '0xccd0af2cb0299880101ff6558c3000a719e485677a9792bc24c4366ac78d1bf4',
        txStatus: 'FAIL',
        blockNum: null,
        eventAddress: '0xeaf92b5aabe6028fdbe5889a6705fbc0e2e2da8d',
        betterAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
        resultIndex: 1,
        amount: '300000000',
        eventRound: 0,
      },
    ];
    let bet;
    let betCount;

    describe('find bet', () => {
      it('find empty bets db', async () => {
        betCount = await db.Bets.count({});
        betCount.should.equal(0);
        bet = await DBHelper.findBet({});
        bet.length.should.equal(0);
      });

      it('find on non-empty bets db', async () => {
        await DBHelper.insertBet(mockBets[0]);
        await DBHelper.insertBet(mockBets[1]);
        const foundBets = await DBHelper.findBet({}, { blockNum: -1 });
        foundBets.length.should.equal(2);
        expect(foundBets[0]).excluding('_id').to.deep.equal(mockBets[0]);
        expect(foundBets[1]).excluding('_id').to.deep.equal(mockBets[1]);
      });
    });

    describe('find one bet', () => {
      it('find existed bet', async () => {
        bet = await DBHelper.findOneBet({ txid: mockBets[0].txid });
        should.exist(bet);
        expect(bet).excluding('_id').to.deep.equal(mockBets[0]);
      });

      it('find non-existed bet', async () => {
        bet = await DBHelper.findOneBet({ txid: '0x12333' });
        should.not.exist(bet);
      });
    });

    describe('count bet', () => {
      it('bet counts should right', async () => {
        betCount = await DBHelper.countBet({});
        betCount.should.equal(2);
      });
    });

    describe('insert bet', () => {
      it('should insert new bet', async () => {
        betCount = await db.Bets.count({});
        betCount.should.equal(2);
        await DBHelper.insertBet(mockBets[2]);
        betCount = await db.Bets.count({});
        betCount.should.equal(3);
        bet = await DBHelper.findOneBet({ txid: mockBets[2].txid });
        should.exist(bet);
        expect(bet).excluding('_id').to.deep.equal(mockBets[2]);
      });

      it('should not insert existed txid bet', async () => {
        const newBetWithExistedTxid = {
          txType: 'BET',
          txid: '0xccd0af2cb0299880101ff6558c3000a719e485677a9792bc24c4366ac78d1bf4',
          txStatus: 'SUCCESS',
          blockNum: 1233242,
          eventAddress: '0xeaf92b5aabe6028fdbe5889a6705f322e2da8d',
          betterAddress: '0x47ba776b3ed5d5325345fee72fa483baffa7e',
          resultIndex: 1,
          amount: '300000000',
          eventRound: 0,
        };
        betCount = await db.Bets.count({});
        betCount.should.equal(3);
        await DBHelper.insertBet(newBetWithExistedTxid);
        betCount = await db.Bets.count({});
        betCount.should.equal(3);
        bet = await DBHelper.findOneBet({ txid: newBetWithExistedTxid.txid });
        should.exist(bet);
        expect(bet).excluding(['_id']).to.deep.equal(newBetWithExistedTxid);
      });
    });

    describe('update bet', () => {
      it('update bet', async () => {
        const updateNewBet = {
          txType: 'BET',
          txid: '0xccd0af2cb0299880101ff6558c3000a719e485677a9792bc24c4366ac78d1bf4',
          txStatus: 'FAIL',
          blockNum: null,
          eventAddress: '0xeaf92b5aabe6028fdbe5889a6705fbc0e2e2da8d',
          betterAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
          resultIndex: 1,
          amount: '300000000',
          eventRound: 0,
        };
        bet = await DBHelper.findOneBet({ txid: mockBets[2].txid });
        expect(bet).excluding(['_id']).to.deep.not.equal(updateNewBet);
        await DBHelper.updateBet(mockBets[2].txid, updateNewBet);
        betCount = await db.Bets.count({});
        betCount.should.equal(3);
        bet = await DBHelper.findOneBet({ txid: updateNewBet.txid });
        should.exist(bet);
        expect(bet).excluding(['_id']).to.deep.equal(updateNewBet);
      });
    });
  });

  /* ResultSets */
  describe('test ResultSets db', () => {
    const mockResultSets = [
      {
        txType: 'RESULT_SET',
        txid: '0xd3594c878efb45d8d38bd4c2e0698541b21d565914f71fe85e9033612d81fab0',
        txStatus: 'SUCCESS',
        blockNum: 4151388,
        eventAddress: '0x72dd97e774f27b61bf58669be4dbabf9c3d349a4',
        centralizedOracleAddress: '0x939592864c0bd3355b2d54e4fa2203e8343b6d6a',
        resultIndex: 2,
        amount: '1000000000',
        eventRound: 0,
        nextConsensusThreshold: '1100000000',
        nextArbitrationEndTime: 1560808386,
        _id: '9vUiWlt9b123XCHv',
      },
      {
        txType: 'RESULT_SET',
        txid: '0xb296dd8bb6509f4fefe746f47c3d497d5f553c72d0b1fd2f8c000ae39e3ffd7f',
        txStatus: 'SUCCESS',
        blockNum: 3779203,
        eventAddress: '0x069278634f2d9fcae31755596a88b53568fb7c76',
        centralizedOracleAddress: null,
        resultIndex: 1,
        amount: '12100000000',
        eventRound: 2,
        nextConsensusThreshold: '13310000000',
        nextArbitrationEndTime: 1559777920,
        _id: 'A4I2nTKSnxfL3exe',
      },
      {
        txType: 'RESULT_SET',
        txid: '0x913bb4c524f96e94cefa1bceb320b4c62945a1a76acfd51750c739455c4b94a8',
        txStatus: 'SUCCESS',
        blockNum: 4950806,
        eventAddress: '0xcd4a3e87c45f701f2d3070372506b49f6d0d2c85',
        centralizedOracleAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
        resultIndex: 2,
        amount: '1000000000',
        eventRound: 0,
        nextConsensusThreshold: '1100000000',
        nextArbitrationEndTime: 1560206636,
        _id: 'Fkp4Ev3JpZHBaef6',
      },
      {
        txType: 'RESULT_SET',
        txid: '0x61e87de9febbbee5a6ed8aea010a59c18ad917962fed0060e44c97d1a51c7e7c',
        txStatus: 'SUCCESS',
        blockNum: 4835039,
        eventAddress: '0x405c53142452e96e9c8cfcfd81d7db8326b8c6ce',
        centralizedOracleAddress: '0x47ba776b3ed5d514d3e206ffee72fa483baffa7e',
        resultIndex: 2,
        amount: '10000000000',
        eventRound: 0,
        nextConsensusThreshold: '11000000000',
        nextArbitrationEndTime: 1559945430,
        _id: 'An4xD8aSDrDuu7Yy',
      },
    ];
    let resultSet;
    let resultSetCount;

    describe('find result set', () => {
      it('find empty resultSets db', async () => {
        resultSetCount = await db.ResultSets.count({});
        resultSetCount.should.equal(0);
        resultSetCount = await DBHelper.findResultSet({});
        resultSetCount.length.should.equal(0);
      });

      it('find on non-empty resultSets db', async () => {
        await DBHelper.insertResultSet(mockResultSets[0]);
        await DBHelper.insertResultSet(mockResultSets[1]);
        const foundResultSets = await DBHelper.findResultSet({}, { blockNum: -1 });
        foundResultSets.length.should.equal(2);
        expect(foundResultSets[0]).excluding('_id').to.deep.equal(mockResultSets[0]);
        expect(foundResultSets[1]).excluding('_id').to.deep.equal(mockResultSets[1]);
      });
    });

    describe('find one result set', () => {
      it('find existing result set', async () => {
        resultSet = await DBHelper.findOneResultSet({ txid: mockResultSets[0].txid });
        should.exist(resultSet);
        expect(resultSet).excluding('_id').to.deep.equal(mockResultSets[0]);
      });

      it('should not find on non-existing result set', async () => {
        resultSet = await DBHelper.findOneResultSet({ txid: '0x12333' });
        should.not.exist(resultSet);
      });
    });

    describe('find latest result set', () => {
      it('should find latest result set', async () => {
        resultSet = await DBHelper.findLatestResultSet();
        resultSet.length.should.equal(1);
        expect(resultSet[0]).excluding('_id').to.deep.equal(mockResultSets[0]);
        await DBHelper.insertResultSet(mockResultSets[2]);
        resultSet = await DBHelper.findLatestResultSet();
        resultSet.length.should.equal(1);
        expect(resultSet[0]).excluding('_id').to.deep.equal(mockResultSets[2]);
      });
    });

    describe('count result set', () => {
      it('result set counts should right', async () => {
        resultSetCount = await DBHelper.countResultSet({});
        resultSetCount.should.equal(3);
      });
    });

    describe('insert result set', () => {
      it('should insert new result set', async () => {
        resultSetCount = await db.ResultSets.count({});
        resultSetCount.should.equal(3);
        await DBHelper.insertResultSet(mockResultSets[3]);
        resultSetCount = await db.ResultSets.count({});
        resultSetCount.should.equal(4);
        resultSet = await DBHelper.findOneResultSet({ txid: mockResultSets[3].txid });
        should.exist(resultSet);
        expect(resultSet).excluding('_id').to.deep.equal(mockResultSets[3]);
      });

      it('insert existed txid result set', async () => {
        const newResultSetWithExistedTxid = {
          txType: 'RESULT_SET',
          txid: '0x61e87de9febbbee5a6ed8aea010a59c18ad917962fed0060e44c97d1a51c7e7c',
          txStatus: 'FAIL',
          blockNum: 3835039,
          eventAddress: '0x405c53142452e96e9c8cfcfd81d7db8326b8c6ce',
          centralizedOracleAddress: '0x47ba776b32323514d3e206ffee72fa483baffa7e',
          resultIndex: 1,
          amount: '1000230000000',
          eventRound: 0,
          nextConsensusThreshold: '11000000000',
          nextArbitrationEndTime: 1559945430,
          _id: 'An4xD8aSDrDuu7Yy',
        };
        await DBHelper.insertResultSet(newResultSetWithExistedTxid);
        resultSetCount = await db.ResultSets.count({});
        resultSetCount.should.equal(4);
        resultSet = await DBHelper.findOneResultSet({ txid: newResultSetWithExistedTxid.txid });
        should.exist(resultSet);
        expect(resultSet).excluding(['_id']).to.deep.equal(newResultSetWithExistedTxid);
      });
    });

    describe('update result set', () => {
      it('update result set', async () => {
        const updateNewResultSet = {
          txType: 'RESULT_SET',
          txid: '0x61e87de9febbbee5a6ed8aea010a59c18ad917962fed0060e44c97d1a51c7e7c',
          txStatus: 'SUCCESS',
          blockNum: 2324243,
          eventAddress: '0x405c53142452e96e9c8cfcfd81d7db8326b8c6ce',
          centralizedOracleAddress: '0x8732763715473274928',
          resultIndex: 0,
          amount: '10000000000',
          eventRound: 0,
          nextConsensusThreshold: '11000000000',
          nextArbitrationEndTime: 1559945430,
          _id: 'An4xD8aSDrDuu7Yy',
        };
        resultSet = await DBHelper.findOneResultSet({ txid: mockResultSets[3].txid });
        expect(resultSet).excluding(['_id']).to.deep.not.equal(updateNewResultSet);
        await DBHelper.updateResultSet(mockResultSets[3].txid, updateNewResultSet);
        resultSetCount = await db.ResultSets.count({});
        resultSetCount.should.equal(4);
        resultSet = await DBHelper.findOneResultSet({ txid: updateNewResultSet.txid });
        should.exist(resultSet);
        expect(resultSet).excluding(['_id']).to.deep.equal(updateNewResultSet);
      });
    });
  });

  after(async () => {
    fs.removeSync(getDbDir());
  });
});

