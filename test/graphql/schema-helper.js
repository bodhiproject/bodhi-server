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

const PAGINATED_BETS = `
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
    betterAddress
    resultIndex
    amount
    eventRound
    resultName
  }
`;

module.exports = {
  PAGE_INFO,
  BLOCK,
  TX_RECEIPT,
  PAGINATED_BETS,
};
