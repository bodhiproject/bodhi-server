const PAGE_INFO = `
  pageInfo {
    hasNextPage
    pageNumber
    count
  }
`;

const BLOCK = `
  block {
    blockNum
    blockTime
  }
`;

const TX_RECEIPT = `
  txReceipt {
    status
    blockHash
    blockNumber
    transactionHash
    from
    to
    contractAddress
    cumulativeGasUsed
    gasUsed
    gasPrice
  }
`;

const MULTIPLE_RESULTS_EVENT = `
  txType
  txid
  txStatus
  ${TX_RECEIPT}
  blockNum
  ${BLOCK}
  address
  ownerAddress
  version
  name
  results
  numOfResults
  centralizedOracle
  betStartTime
  betEndTime
  resultSetStartTime
  resultSetEndTime
  escrowAmount
  arbitrationLength
  thresholdPercentIncrease
  arbitrationRewardPercentage
  currentRound
  currentResultIndex
  consensusThreshold
  arbitrationEndTime
  status
  language
  pendingTxs {
    bet
    resultSet
    withdraw
    total
  }
  totalBets
`;

const PAGINATED_EVENTS = `
  totalCount
  ${PAGE_INFO}
  items {
    ${MULTIPLE_RESULTS_EVENT}
  }
`;

const BET = `
  txType
  txid
  txStatus
  ${TX_RECEIPT}
  blockNum
  ${BLOCK}
  eventAddress
  betterAddress
  resultIndex
  amount
  eventRound
  resultName
  eventName
`;

const PAGINATED_BETS = `
  totalCount
  ${PAGE_INFO}
  items {
    ${BET}
  }
`;

const RESULT_SET = `
  txType
  txid
  txStatus
  ${TX_RECEIPT}
  blockNum
  ${BLOCK}
  eventAddress
  centralizedOracleAddress
  resultIndex
  amount
  eventRound
  resultName
`;

const PAGINATED_RESULT_SETS = `
  totalCount
  ${PAGE_INFO}
  items {
    ${RESULT_SET}
  }
`;

const PAGINATED_WITHDRAWS = `
  totalCount
  ${PAGE_INFO}
  items {
    txType
    txid
    txStatus
    ${TX_RECEIPT}
    blockNum
    ${BLOCK}
    eventAddress
    winnerAddress
    winningAmount
    escrowWithdrawAmount
  }
`;

module.exports = {
  PAGE_INFO,
  BLOCK,
  TX_RECEIPT,
  MULTIPLE_RESULTS_EVENT,
  PAGINATED_EVENTS,
  PAGINATED_BETS,
  PAGINATED_RESULT_SETS,
  PAGINATED_WITHDRAWS,
  BET,
  RESULT_SET,
};
