/* eslint-disable */
/**
 * Use the contract version number as the object key.
 */
module.exports = {
  3: {
    abi: [{"constant": true,"inputs": [],"name": "owner","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [{"name": "owner","type": "address"},{"name": "eventName","type": "string"},{"name": "eventResults","type": "bytes32[4]"},{"name": "numOfResults","type": "uint8"},{"name": "betStartTime","type": "uint256"},{"name": "betEndTime","type": "uint256"},{"name": "resultSetStartTime","type": "uint256"},{"name": "resultSetEndTime","type": "uint256"},{"name": "centralizedOracle","type": "address"},{"name": "arbitrationOptionIndex","type": "uint8"},{"name": "arbitrationRewardPercentage","type": "uint256"},{"name": "configManager","type": "address"}],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "better","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "BetPlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "centralizedOracle","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "ResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "VotePlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "VoteResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "winner","type": "address"},{"indexed": false,"name": "winningAmount","type": "uint256"},{"indexed": false,"name": "escrowAmount","type": "uint256"}],"name": "WinningsWithdrawn","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_previousOwner","type": "address"},{"indexed": true,"name": "_newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"constant": false,"inputs": [{"name": "from","type": "address"},{"name": "value","type": "uint256"},{"name": "data","type": "bytes"}],"name": "tokenFallback","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [],"name": "withdraw","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "better","type": "address"}],"name": "calculateWinnings","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "version","outputs": [{"name": "","type": "uint16"}],"payable": false,"stateMutability": "pure","type": "function"},{"constant": true,"inputs": [],"name": "currentRound","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentResultIndex","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentConsensusThreshold","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentArbitrationEndTime","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "eventMetadata","outputs": [{"name": "","type": "uint16"},{"name": "","type": "string"},{"name": "","type": "bytes32[4]"},{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "centralizedMetadata","outputs": [{"name": "","type": "address"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "configMetadata","outputs": [{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "totalBets","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "withdrawer","type": "address"}],"name": "didWithdraw","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "didWithdrawEscrow","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"}],
  },
  2: {
    abi: [{"constant": true,"inputs": [],"name": "owner","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [{"name": "owner","type": "address"},{"name": "eventName","type": "string"},{"name": "eventResults","type": "bytes32[11]"},{"name": "numOfResults","type": "uint8"},{"name": "betStartTime","type": "uint256"},{"name": "betEndTime","type": "uint256"},{"name": "resultSetStartTime","type": "uint256"},{"name": "resultSetEndTime","type": "uint256"},{"name": "centralizedOracle","type": "address"},{"name": "configManager","type": "address"}],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "better","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "BetPlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "centralizedOracle","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "ResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "VotePlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "VoteResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "winner","type": "address"},{"indexed": false,"name": "winningAmount","type": "uint256"},{"indexed": false,"name": "escrowAmount","type": "uint256"}],"name": "WinningsWithdrawn","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_previousOwner","type": "address"},{"indexed": true,"name": "_newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"constant": false,"inputs": [{"name": "from","type": "address"},{"name": "value","type": "uint256"},{"name": "data","type": "bytes"}],"name": "tokenFallback","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [],"name": "withdraw","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "better","type": "address"}],"name": "calculateWinnings","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "version","outputs": [{"name": "","type": "uint16"}],"payable": false,"stateMutability": "pure","type": "function"},{"constant": true,"inputs": [],"name": "currentRound","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentResultIndex","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentConsensusThreshold","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentArbitrationEndTime","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "eventMetadata","outputs": [{"name": "","type": "uint16"},{"name": "","type": "string"},{"name": "","type": "bytes32[11]"},{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "centralizedMetadata","outputs": [{"name": "","type": "address"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "configMetadata","outputs": [{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "totalBets","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "withdrawer","type": "address"}],"name": "didWithdraw","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "didWithdrawEscrow","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"}],
  },
  1: {
    abi: [{"constant": true,"inputs": [],"name": "owner","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [{"name": "owner","type": "address"},{"name": "eventName","type": "string"},{"name": "eventResults","type": "bytes32[11]"},{"name": "numOfResults","type": "uint8"},{"name": "betStartTime","type": "uint256"},{"name": "betEndTime","type": "uint256"},{"name": "resultSetStartTime","type": "uint256"},{"name": "resultSetEndTime","type": "uint256"},{"name": "centralizedOracle","type": "address"},{"name": "configManager","type": "address"}],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "better","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "BetPlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "centralizedOracle","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "ResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "VotePlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "VoteResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "winner","type": "address"},{"indexed": false,"name": "winningAmount","type": "uint256"},{"indexed": false,"name": "escrowAmount","type": "uint256"}],"name": "WinningsWithdrawn","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_previousOwner","type": "address"},{"indexed": true,"name": "_newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"constant": false,"inputs": [{"name": "from","type": "address"},{"name": "value","type": "uint256"},{"name": "data","type": "bytes"}],"name": "tokenFallback","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [],"name": "withdraw","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "better","type": "address"}],"name": "calculateWinnings","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "version","outputs": [{"name": "","type": "uint16"}],"payable": false,"stateMutability": "pure","type": "function"},{"constant": true,"inputs": [],"name": "currentRound","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentResultIndex","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentConsensusThreshold","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentArbitrationEndTime","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "eventMetadata","outputs": [{"name": "","type": "uint16"},{"name": "","type": "string"},{"name": "","type": "bytes32[11]"},{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "centralizedMetadata","outputs": [{"name": "","type": "address"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "configMetadata","outputs": [{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "totalBets","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "withdrawer","type": "address"}],"name": "didWithdraw","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "didWithdrawEscrow","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"}],
  },
  0: {
    abi: [{"constant": true,"inputs": [],"name": "owner","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [{"name": "owner","type": "address"},{"name": "eventName","type": "string"},{"name": "eventResults","type": "bytes32[11]"},{"name": "numOfResults","type": "uint8"},{"name": "betStartTime","type": "uint256"},{"name": "betEndTime","type": "uint256"},{"name": "resultSetStartTime","type": "uint256"},{"name": "resultSetEndTime","type": "uint256"},{"name": "centralizedOracle","type": "address"},{"name": "configManager","type": "address"}],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "better","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "BetPlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "centralizedOracle","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "ResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"}],"name": "VotePlaced","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "voter","type": "address"},{"indexed": false,"name": "resultIndex","type": "uint8"},{"indexed": false,"name": "amount","type": "uint256"},{"indexed": false,"name": "eventRound","type": "uint8"},{"indexed": false,"name": "nextConsensusThreshold","type": "uint256"},{"indexed": false,"name": "nextArbitrationEndTime","type": "uint256"}],"name": "VoteResultSet","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "eventAddress","type": "address"},{"indexed": true,"name": "winner","type": "address"},{"indexed": false,"name": "winningAmount","type": "uint256"},{"indexed": false,"name": "escrowAmount","type": "uint256"}],"name": "WinningsWithdrawn","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_previousOwner","type": "address"},{"indexed": true,"name": "_newOwner","type": "address"}],"name": "OwnershipTransferred","type": "event"},{"constant": false,"inputs": [{"name": "from","type": "address"},{"name": "value","type": "uint256"},{"name": "data","type": "bytes"}],"name": "tokenFallback","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [],"name": "withdraw","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "calculateWinnings","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "version","outputs": [{"name": "","type": "uint16"}],"payable": false,"stateMutability": "pure","type": "function"},{"constant": true,"inputs": [],"name": "currentRound","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentResultIndex","outputs": [{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentConsensusThreshold","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "currentArbitrationEndTime","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "eventMetadata","outputs": [{"name": "","type": "uint16"},{"name": "","type": "string"},{"name": "","type": "bytes32[11]"},{"name": "","type": "uint8"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "centralizedMetadata","outputs": [{"name": "","type": "address"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "configMetadata","outputs": [{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "totalBets","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "withdrawer","type": "address"}],"name": "didWithdraw","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "didWithdrawEscrow","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"}],
  },
};
/* eslint-enable */