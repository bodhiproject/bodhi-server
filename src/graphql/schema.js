module.exports = `

enum OrderDirection {
  DESC
  ASC
}

enum EventStatus {
  CREATED
  BETTING
  ORACLE_RESULT_SETTING
  OPEN_RESULT_SETTING
  ARBITRATION
  WITHDRAWING
}

enum TransactionType {
  CREATE_EVENT
  BET
  SET_RESULT
  VOTE
  WITHDRAW
  TRANSFER
}

enum TransactionStatus {
  PENDING
  FAIL
  SUCCESS
}

type Block {
  number: Int!
  time: String!
}

type TransactionReceipt {
  status: Boolean!
  blockHash: String!
  blockNumber: String!
  transactionHash: String!
  from: String!
  to: String!
  contractAddress: String!
  cumulativeGasUsed: Int!
  gasUsed: Int!
}

type PageInfo {
  hasNextPage: Boolean!
  pageNumber: Int!
  count: Int!
}

type MultipleResultsEvent {
  txid: String
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  address: String
  ownerAddress: String!
  version: Int!
  name: String!
  results: [String!]!
  numOfResults: Int!
  centralizedOracle: String!
  betStartTime: String!
  betEndTime: String!
  resultSetStartTime: String!
  resultSetEndTime: String!
  escrowAmount: String
  arbitrationLength: String
  thresholdPercentIncrease: String
  arbitrationRewardPercentage: String
  currentRound: Int!
  currentResultIndex: Int!
  consensusThreshold: String
  arbitrationEndTime: String
  totalBets: String
  hashId: String
  status: EventStatus!
  language: String!
  transactions: [Transaction]
}

type Bet {
  txid: String
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  eventAddress: String!
  betterAddress: String!
  resultIndex: Int!
  amount: String!
  eventRound: Int!
  txStatus: TransactionStatus!
}

type ResultSet {
  txid: String
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  eventAddress: String!
  centralizedOracleAddress: String
  resultIndex: Int!
  amount: String!
  eventRound: Int!
  txStatus: TransactionStatus!
}

type Withdraw {
  txid: String
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  eventAddress: String!
  winnerAddress: String!
  winningAmount: String!
  escrowAmount: String!
  txStatus: TransactionStatus!
}

type syncInfo {
  syncBlockNum: Int
  syncBlockTime: String
  syncPercent: Int
}

type AddressBalance {
  address: String!
  nbot: String!
}

type PaginatedOracles {
  totalCount: Int!
  oracles: [Oracle]!
  pageInfo: PageInfo
}

type PaginatedTopics {
  totalCount: Int!
  topics: [Topic]!
  pageInfo: PageInfo
}

type AccumulatedVote {
  topicAddress: String
  voterAddress: String!
  amount: String!
  token: _TokenType!
}

type PaginatedAccumulatedVotes {
  totalCount: Int!
  votes: [AccumulatedVote]!
  pageInfo: PageInfo
}

type Winner {
  topicAddress: String!
  voterAddress: String!
  amount: TokenAmount!
}

type LeaderboardStats {
  eventCount: String!
  participantsCount: String!
  totalQtum: String!
  totalBot: String!
}

type TokenAmount {
  qtum: String!
  bot: String!
}

input Order {
  field: String!
  direction: OrderDirection!
}

input EventFilter {
  OR: [EventFilter!]
  txid: String
  address: String
  ownerAddress: String
  resultIndex: Int
  hashId: String
  eventStatus: EventStatus
  language: String
}

input BetFilter {
  OR: [BetFilter!]
  txid: String
  eventAddress: String
  betterAddress: String
  resultIndex: Int
  eventRound: Int
}

input ResultSetFilter {
  OR: [ResultSetFilter!]
  txid: String
  eventAddress: String
  centralizedOracleAddress: String
  resultIndex: Int
  eventRound: Int
}

input WithdrawFilter {
  OR: [WithdrawFilter!]
  txid: String
  eventAddress: String
  winnerAddress: String
}

type Query {
  allTopics(filter: TopicFilter, orderBy: [Order!], limit: Int, skip: Int): PaginatedTopics!
  allOracles(filter: OracleFilter, orderBy: [Order!], limit: Int, skip: Int ): PaginatedOracles!
  searchTopics(searchPhrase: String, filter: TopicFilter, orderBy: [Order!], limit: Int, skip: Int): [Topic]!
  searchOracles(searchPhrase: String, filter: OracleFilter, orderBy: [Order!], limit: Int, skip: Int): [Oracle]!
  allVotes(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): [Vote]!
  mostVotes(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): PaginatedAccumulatedVotes!
  winners(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): [Winner]!
  leaderboardStats(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): LeaderboardStats!
  resultSets(filter: ResultSetFilter, orderBy: [Order!], limit: Int, skip: Int): [ResultSet]!
  withdraws(filter: WithdrawFilter, orderBy: [Order!], limit: Int, skip: Int): [Withdraw]!
  allTransactions(filter: TransactionFilter, orderBy: [Order!], limit: Int, skip: Int): [Transaction]!
  syncInfo(includeBalance: Boolean): syncInfo!
  addressBalances: [AddressBalance!]
}

type Mutation {
  createEvent(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    name: String!
    options: [String!]!
    resultSetterAddress: String!
    bettingStartTime: String!
    bettingEndTime: String!
    resultSettingStartTime: String!
    resultSettingEndTime: String!
    amount: String!
    language: String!
  ): Transaction

  setResult(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
  ): Transaction

  approveVote(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
  ): Transaction

  createVote(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
  ): Transaction

  finalizeResult(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
  ): Transaction

  withdraw(
    type: _TransactionType!
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
  ): Transaction

  transfer(
    senderAddress: String!
    receiverAddress: String!
    token: _TokenType!
    amount: String!
  ): Transaction
}

type Subscription {
  onSyncInfo: syncInfo
  onApproveSuccess: Transaction
}
`;
