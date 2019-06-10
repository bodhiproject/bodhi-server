const { AbiCoder } = require('web3-eth-abi');
const ResultSet = require('../../models/result-set');
const { TX_STATUS } = require('../../constants');

const abiCoder = new AbiCoder();

module.exports = ({ log }) => {
  const eventAddress = abiCoder.decodeParameter('address', log.topics[1]);
  const centralizedOracleAddress = abiCoder.decodeParameter('address', log.topics[2]);
  const decodedData = abiCoder.decodeParameters(
    ['uint8', 'uint256', 'uint8', 'uint256', 'uint256'],
    log.data,
  );
  const resultIndex = decodedData['0'];
  const amount = decodedData['1'];
  const eventRound = decodedData['2'];
  const nextConsensusThreshold = decodedData['3'];
  const nextArbitrationEndTime = decodedData['4'];

  return new ResultSet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    centralizedOracleAddress: Number(eventRound) === 0
      ? centralizedOracleAddress
      : null,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
    nextConsensusThreshold: nextConsensusThreshold.toString(10),
    nextArbitrationEndTime: Number(nextArbitrationEndTime.toString(10)),
  });
};
