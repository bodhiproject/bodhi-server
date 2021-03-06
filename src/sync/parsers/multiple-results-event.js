const { AbiCoder } = require('web3-eth-abi');
const MultipleResultsEvent = require('../../models/multiple-results-event');
const { TX_STATUS } = require('../../constants');
const { determineContractVersion, multipleResultsEventMeta } = require('../../config');
const { getContract } = require('../../utils/web3-utils');

const abiCoder = new AbiCoder();

module.exports = async ({ log }) => {
  const address = abiCoder.decodeParameter('address', log.topics[1]);
  const ownerAddress = abiCoder.decodeParameter('address', log.topics[2]);

  const contractVersion = determineContractVersion(Number(log.blockNumber));
  const eventMeta = multipleResultsEventMeta(contractVersion);

  // Get event data
  const contract = getContract(eventMeta.abi, address);
  let res = await contract.methods.eventMetadata().call();
  const version = res['0'];
  const eventName = res['1'];
  const eventResults = res['2'];
  const numOfResults = res['3'];

  res = await contract.methods.centralizedMetadata().call();
  const centralizedOracle = res['0'];
  const betStartTime = res['1'];
  const betEndTime = res['2'];
  const resultSetStartTime = res['3'];
  const resultSetEndTime = res['4'];

  res = await contract.methods.configMetadata().call();
  const escrowAmount = res['0'];
  const arbitrationLength = res['1'];
  const thresholdPercentIncrease = res['2'];
  const arbitrationRewardPercentage = res['3'];

  const consensusThreshold =
    await contract.methods.currentConsensusThreshold().call();
  const arbitrationEndTime =
    await contract.methods.currentArbitrationEndTime().call();

  return new MultipleResultsEvent({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    address,
    ownerAddress,
    version: Number(version),
    name: eventName,
    results: eventResults,
    numOfResults: Number(numOfResults),
    centralizedOracle,
    betStartTime: betStartTime.toNumber(),
    betEndTime: betEndTime.toNumber(),
    resultSetStartTime: resultSetStartTime.toNumber(),
    resultSetEndTime: resultSetEndTime.toNumber(),
    escrowAmount: escrowAmount.toString(10),
    arbitrationLength: arbitrationLength.toNumber(),
    thresholdPercentIncrease: thresholdPercentIncrease.toString(10),
    arbitrationRewardPercentage: arbitrationRewardPercentage.toNumber(),
    consensusThreshold: consensusThreshold.toString(10),
    arbitrationEndTime: arbitrationEndTime.toNumber(),
  });
};
