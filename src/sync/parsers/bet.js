const web3 = require('../../web3');
const Bet = require('../../models/bet');
const { TX_STATUS } = require('../../constants');

module.exports = ({ log }) => {
  const eventAddress = web3.eth.abi.decodeParameter('address', log.topics[1]);
  const betterAddress = web3.eth.abi.decodeParameter('address', log.topics[2]);
  const decodedData = web3.eth.abi.decodeParameters(
    ['uint8', 'uint256', 'uint8'],
    log.data,
  );
  const resultIndex = decodedData['0'];
  const amount = decodedData['1'];
  const eventRound = decodedData['2'];

  return new Bet({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    betterAddress,
    resultIndex: Number(resultIndex),
    amount: amount.toString(10),
    eventRound: Number(eventRound),
  });
};
