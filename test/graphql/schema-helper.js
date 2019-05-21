module.exports = {
  PAGE_INFO: `
    pageInfo {
      hasNextPage
      pageNumber
      count
    }
  `,

  BLOCK: `
    block {
      blockNum
      blockTime
    }
  `,

  TX_RECEIPT: `
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
  `,
};
