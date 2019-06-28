const { isString, isNumber, isArray, isBoolean } = require('lodash');
const Chai = require('chai');
const sinon = require('sinon');
const ChaiAsPromised = require('chai-as-promised');

const ConfigManager = require('../../src/api/config-manager');
const { getContract } = require('./mock/contract');

Chai.use(ChaiAsPromised);
const assert = Chai.assert;
const expect = Chai.expect;

const eventAddress = '0x8b2b1838efff78e5ed9e00d95d9ef071f2c27be6';
const address = '0x939592864C0Bd3355B2D54e4fA2203E8343B6d6a';

describe('api/multiple-results-event', () => {
  let stubGetContract;
  beforeEach(() => {
      stubGetContract = sinon.stub(ConfigManager, 'getContract').callsFake(getContract);
  });

  afterEach(() => {
    stubGetContract.restore();
  });

  describe('calculateWinnings()', () => {
    it('It returns the calculateWinnings', async () => {
      const res = await ConfigManager.calculateWinnings({ eventAddress, address });
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.calculateWinnings({
        address,
      })).to.be.rejectedWith(Error);
    });

    it('It throws if address is undefined', () => {
      expect(ConfigManager.calculateWinnings({
        eventAddress,
      })).to.be.rejectedWith(Error);
    });
  });

  describe('version()', () => {
    it('It returns the version', async () => {
      const res = await ConfigManager.version({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isNumber(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.version({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentRound()', () => {
    it('It returns the currentRound', async () => {
      const res = await ConfigManager.currentRound({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isNumber(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.currentRound({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentResultIndex()', () => {
    it('It returns the currentResultIndex', async () => {
      const res = await ConfigManager.currentResultIndex({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isNumber(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.currentResultIndex({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentConsensusThreshold()', () => {
    it('It returns the currentConsensusThreshold', async () => {
      const res = await ConfigManager.currentConsensusThreshold({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.currentConsensusThreshold({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentArbitrationEndTime()', () => {
    it('It returns the currentArbitrationEndTime', async () => {
      const res = await ConfigManager.currentArbitrationEndTime({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.currentArbitrationEndTime({})).to.be.rejectedWith(Error);
    });
  });

  describe('eventMetadata()', () => {
    it('It returns the eventMetadata', async () => {
      const res = await ConfigManager.eventMetadata({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isArray(res));
      assert.isTrue(res.length === 4);

      assert.isTrue(isNumber(res[0]));
      assert.isTrue(isString(res[1]));
      assert.isTrue(isArray(res[2]));
      assert.isTrue(isNumber(res[3]));
      assert.isTrue(res[2].length === res[3]);
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.eventMetadata({})).to.be.rejectedWith(Error);
    });
  });

  describe('centralizedMetadata()', () => {
    it('It returns the centralizedMetadata', async () => {
      const res = await ConfigManager.centralizedMetadata({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isArray(res));
      assert.isTrue(res.length === 5);

      assert.isTrue(isString(res[0]));
      assert.isTrue(isString(res[1]));
      assert.isFalse(isNaN(res[1]));
      assert.isTrue(isString(res[2]));
      assert.isFalse(isNaN(res[2]));
      assert.isTrue(isString(res[3]));
      assert.isFalse(isNaN(res[3]));
      assert.isTrue(isString(res[4]));
      assert.isFalse(isNaN(res[4]));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.centralizedMetadata({})).to.be.rejectedWith(Error);
    });
  });

  describe('configMetadata()', () => {
    it('It returns the configMetadata', async () => {
      const res = await ConfigManager.configMetadata({ eventAddress });
      assert.isDefined(res);
      assert.isTrue(isArray(res));
      assert.isTrue(res.length === 4);

      assert.isTrue(isString(res[0]));
      assert.isFalse(isNaN(res[0]));
      assert.isTrue(isString(res[1]));
      assert.isFalse(isNaN(res[1]));
      assert.isTrue(isString(res[2]));
      assert.isFalse(isNaN(res[2]));
      assert.isTrue(isString(res[3]));
      assert.isFalse(isNaN(res[3]));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.configMetadata({})).to.be.rejectedWith(Error);
    });
  });

  describe('totalBets()', () => {
    it('It returns the totalBets', async () => {
      const res = await ConfigManager.totalBets({ eventAddress, address });
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.totalBets({})).to.be.rejectedWith(Error);
    });
  });

  describe('didWithdraw()', () => {
    it('It returns the didWithdraw', async () => {
      const res = await ConfigManager.didWithdraw({ eventAddress, address });
      assert.isDefined(res);
      assert.isTrue(isBoolean(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.didWithdraw({
        address,
      })).to.be.rejectedWith(Error);
    });

    it('It throws if address is undefined', () => {
      expect(ConfigManager.didWithdraw({
        eventAddress,
      })).to.be.rejectedWith(Error);
    });
  });

  describe('didWithdrawEscrow()', () => {
    it('It returns the didWithdrawEscrow', async () => {
      const res = await ConfigManager.didWithdrawEscrow({ eventAddress, address });
      assert.isDefined(res);
      assert.isTrue(isBoolean(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(ConfigManager.didWithdrawEscrow({})).to.be.rejectedWith(Error);
    });
  });
});