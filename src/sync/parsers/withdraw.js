const { AbiCoder } = require('web3-eth-abi');
const Withdraw = require('../../models/withdraw');
const { TX_STATUS } = require('../../constants');

const abiCoder = new AbiCoder();

module.exports = ({ log }) => {
  const eventAddress = abiCoder.decodeParameter('address', log.topics[1]);
  const winnerAddress = abiCoder.decodeParameter('address', log.topics[2]);
  const decodedData = abiCoder.decodeParameters(
    ['uint256', 'uint256'],
    log.data,
  );
  const winningAmount = decodedData['0'];
  const escrowWithdrawAmount = decodedData['1'];

  return new Withdraw({
    txid: log.transactionHash,
    txStatus: TX_STATUS.SUCCESS,
    blockNum: Number(log.blockNumber),
    eventAddress,
    winnerAddress,
    winningAmount: winningAmount.toString(10),
    escrowWithdrawAmount: escrowWithdrawAmount.toString(10),
  });
};
