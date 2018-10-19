module.exports = `

enum _OracleStatusType {
  CREATED
  VOTING
  WAITRESULT
  OPENRESULTSET
  PENDING
  WITHDRAW
}

enum _WithdrawType {
  ESCROW
  WINNINGS
}

enum _TokenType {
  QTUM
  BOT
}

enum _OrderDirection {
  DESC
  ASC
}

enum _TransactionType {
  APPROVECREATEEVENT
  CREATEEVENT
  BET
  APPROVESETRESULT
  SETRESULT
  APPROVEVOTE
  VOTE
  RESETAPPROVE
  FINALIZERESULT
  WITHDRAW
  WITHDRAWESCROW
  TRANSFER
}

enum _TransactionStatus {
   PENDING
   FAIL
   SUCCESS
}

type Topic {
  txid: String!
  blockNum: Int
  address: String
  creatorAddress: String!
  hashId: String
  status: _OracleStatusType!
  name: String!
  options: [String!]!
  qtumAmount: [String!]!
  botAmount: [String!]!
  resultIdx: Int
  escrowAmount: String
  oracles: [Oracle]
  transactions: [Transaction]
  version: Int!
  language: String!
}

type Oracle {
  txid: String!
  blockNum: Int
  address: String
  topicAddress: String
  hashId: String
  status: _OracleStatusType!
  name: String!
  options: [String!]!
  optionIdxs: [Int!]!
  resultIdx: Int
  amounts: [String!]!
  token: String!
  startTime: String!
  endTime: String!
  resultSetStartTime: String
  resultSetEndTime: String
  resultSetterAddress: String
  consensusThreshold: String
  transactions: [Transaction]
  version: Int!
  language: String!
}

type Vote {
  txid: String!
  blockNum: Int!
  block: Block!
  topicAddress: String!
  oracleAddress: String!
  voterAddress: String!
  optionIdx: Int!
  token: _TokenType!
  amount: String!
  version: Int!
}

type ResultSet {
  txid: String!
  blockNum: Int!
  block: Block!
  topicAddress: String!
  oracleAddress: String
  fromAddress: String!
  resultIdx: Int!
  version: Int!
}

type Withdraw {
  txid: String!
  blockNum: Int!
  block: Block!
  type: _WithdrawType!
  topicAddress: String!
  withdrawerAddress: String!
  qtumAmount: String!
  botAmount: String!
  version: Int
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
  blockNum: Int!
  blockTime: String!
}

type syncInfo {
  syncBlockNum: Int
  syncBlockTime: String
  syncPercent: Int
  peerNodeCount: Int
  addressBalances: [AddressBalance]
}

type AddressBalance {
  address: String!
  qtum: String!
  bot: String!
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
  topicAddress: String!
  voterAddress: String!
  amount: String!
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
  direction: _OrderDirection!
}

type Query {
  allTopics(filter: TopicFilter, orderBy: [Order!], limit: Int, skip: Int): PaginatedTopics!
  allOracles(filter: OracleFilter, orderBy: [Order!], limit: Int, skip: Int ): PaginatedOracles!
  searchTopics(searchPhrase: String, filter: TopicFilter, orderBy: [Order!], limit: Int, skip: Int): [Topic]!
  searchOracles(searchPhrase: String, filter: OracleFilter, orderBy: [Order!], limit: Int, skip: Int): [Oracle]!
  allVotes(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): [Vote]!
  mostVotes(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): PaginatedAccumulatedVotes!
  winners(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): [Winner]!
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
