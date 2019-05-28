const web3 = require('../../web3');
const ResultSet = require('../../models/result-set');
const { TX_STATUS } = require('../../constants');

module.exports = ({ log }) => {
  const eventAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
  const centralizedOracleAddress = web3.eth.abi.decodeParameter('address', log.topics[2]);
  const decodedData = web3.eth.abi.decodeParameters(
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
