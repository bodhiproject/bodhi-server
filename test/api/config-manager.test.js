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

describe('api/config-manager', () => {
  let stubGetContract;
  beforeEach(() => {
      stubGetContract = sinon.stub(ConfigManager, 'getContract').callsFake(getContract);
  });

  afterEach(() => {
    stubGetContract.restore();
  });

  describe('bodhiTokenAddress()', () => {
    it('It returns the bodhiTokenAddress', async () => {
      const res = await ConfigManager.bodhiTokenAddress();
      assert.isDefined(res);
      assert.isTrue(isString(res));
    });
  });

  describe('eventFactoryAddress()', () => {
    it('It returns the eventFactoryAddress', async () => {
      const res = await ConfigManager.eventFactoryAddress();
      assert.isDefined(res);
      assert.isTrue(isString(res));
    });
  });

  describe('eventEscrowAmount()', () => {
    it('It returns the eventEscrowAmount', async () => {
      const res = await ConfigManager.eventEscrowAmount();
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });
  });

  describe('arbitrationLength()', () => {
    it('It returns the arbitrationLength', async () => {
      const res = await ConfigManager.arbitrationLength();
      assert.isDefined(res);
      assert.isTrue(isArray(res));
      assert.isTrue(res.length === 4);

      assert.isTrue(isNumber(res[0]));
      assert.isTrue(isNumber(res[1]));
      assert.isTrue(isNumber(res[2]));
      assert.isTrue(isNumber(res[3]));
    });
  });

  describe('startingConsensusThreshold()', () => {
    it('It returns the startingConsensusThreshold', async () => {
      const res = await ConfigManager.startingConsensusThreshold();
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
  });

  describe('thresholdPercentIncrease()', () => {
    it('It returns the thresholdPercentIncrease', async () => {
      const res = await ConfigManager.thresholdPercentIncrease();
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });
  });

  describe('isWhitelisted()', () => {
    it('It returns the isWhitelisted', async () => {
      const res = await ConfigManager.isWhitelisted({ address });
      assert.isDefined(res);
      assert.isTrue(isBoolean(res));
    });

    it('It throws if address is undefined', () => {
      expect(ConfigManager.isWhitelisted()).to.be.rejectedWith(Error);
    });
  });
});
