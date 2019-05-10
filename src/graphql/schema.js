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

type MultipleResultsEvent {
  txid: String!
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
  txid: String!
  block: Block!
  eventAddress: String!
  betterAddress: String!
  resultIndex: Int!
  amount: String!
  eventRound: Int!
}

type ResultSet {
  txid: String!
  block: Block!
  eventAddress: String!
  centralizedOracleAddress: String
  resultIndex: Int!
  amount: String!
  eventRound: Int!
}

type Withdraw {
  txid: String!
  block: Block!
  eventAddress: String!
  winnerAddress: String!
  winningAmount: String!
  escrowAmount: String!
}

type Transaction {
  txid: String
  blockNum: Int
  blockTime: String
  createdBlock: Int!
  createdTime: String!
  gasLimit: String!
  gasPrice: String!
  gasUsed: Int
  type: _TransactionType!
  status: _TransactionStatus!
  senderAddress: String!
  receiverAddress: String
  topicAddress: String
  oracleAddress: String
  name: String
  options: [String!]
  resultSetterAddress: String
  bettingStartTime: String
  bettingEndTime: String
  resultSettingStartTime: String
  resultSettingEndTime: String
  optionIdx: Int
  token: _TokenType
  amount: String
  topic: Topic
  version: Int!
  language: String
}

type Block {
  number: Int!
  time: String!
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

type PageInfo {
  hasNextPage: Boolean!
  pageNumber: Int!
  count: Int!
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

input TopicFilter {
  OR: [TopicFilter!]
  txid: String
  address: String
  status: _OracleStatusType
  resultIdx: Int
  creatorAddress: String
  hashId: String
  language: String
}

input OracleFilter {
  OR: [OracleFilter!]
  txid: String
  address: String
  topicAddress: String
  status: _OracleStatusType
  token: _TokenType
  resultSetterAddress: String
  excludeResultSetterAddress: [String]
  hashId: String
  language: String
}

input VoteFilter {
  OR: [VoteFilter!]
  address: String
  topicAddress: String
  oracleAddress: String
  voterAddress: String
  optionIdx: Int
  token: _TokenType
}

input ResultSetFilter {
  OR: [ResultSetFilter!]
  txid: String
  fromAddress: String
  topicAddress: String
  oracleAddress: String
  resultIdx: Int
}

input WithdrawFilter {
  OR: [WithdrawFilter!]
  txid: String
  topicAddress: String
  withdrawerAddress: String
  type: _WithdrawType
}

input TransactionFilter {
  OR: [TransactionFilter!]
  txid: String
  type: _TransactionType
  status: _TransactionStatus
  topicAddress: String
  oracleAddress: String
  senderAddress: String
}

input Order {
  field: String!
  direction: OrderDirection!
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
  resetApprove(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    receiverAddress: String!
    topicAddress: String
    oracleAddress: String
  ): Transaction

  approveCreateEvent(
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

  createBet(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
  ): Transaction

  approveSetResult(
    txid: String
    gasLimit: String
    gasPrice: String
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
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
