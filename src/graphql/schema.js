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
  version: Int!
  blockNum: Int
  status: _OracleStatusType!
  address: String
  escrowAmount: String
  name: String!
  options: [String!]!
  resultIdx: Int
  qtumAmount: [String!]!
  botAmount: [String!]!
  oracles: [Oracle]
  transactions: [Transaction]
  creatorAddress: String!
  hashId: String
}

type Oracle {
  txid: String!
  version: Int!
  blockNum: Int
  status: _OracleStatusType!
  address: String
  topicAddress: String
  resultSetterAddress: String
  resultSetterQAddress: String
  token: String!
  name: String!
  options: [String!]!
  optionIdxs: [Int!]!
  amounts: [String!]!
  resultIdx: Int
  startTime: String!
  endTime: String!
  resultSetStartTime: String
  resultSetEndTime: String
  consensusThreshold: String
  transactions: [Transaction]
  hashId: String
}

type Vote {
  txid: String!
  version: Int!
  blockNum: Int!
  voterAddress: String!
  voterQAddress: String!
  topicAddress: String!
  oracleAddress: String!
  optionIdx: Int!
  token: _TokenType!
  amount: String!
}

type ResultSet {
  blockNum: Int!
  txid: String!
  fromAddress: String!
  version: Int!
  topicAddress: String!
  oracleAddress: String
  resultIdx: Int!
}

type Withdraw {
  blockNum: Int!
  txid: String!
  type: _WithdrawType!
  version: Int
  topicAddress: String!
  withdrawerAddress: String!
  qtumAmount: String!
  botAmount: String!
}

type Transaction {
  type: _TransactionType!
  status: _TransactionStatus!
  txid: String
  createdBlock: Int!
  createdTime: String!
  blockNum: Int
  blockTime: String
  gasLimit: String!
  gasPrice: String!
  gasUsed: Int
  version: Int!
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

input TopicFilter {
  OR: [TopicFilter!]
  txid: String
  address: String
  status: _OracleStatusType
  resultIdx: Int
  creatorAddress: String
  hashId: String
}

input OracleFilter {
  OR: [OracleFilter!]
  txid: String
  address: String
  topicAddress: String
  resultSetterQAddress: String
  status: _OracleStatusType
  token: _TokenType
  excludeResultSetterQAddress: [String]
  hashId: String
}

input VoteFilter {
  OR: [VoteFilter!]
  address: String
  topicAddress: String
  oracleAddress: String
  voterAddress: String
  voterQAddress: String
  optionIdx: Int
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
  senderQAddress: String
}

input Order {
  field: String!
  direction: _OrderDirection!
}

type Query {
  allTopics(filter: TopicFilter, orderBy: [Order!], limit: Int, skip: Int): [Topic]!
  allOracles(filter: OracleFilter, orderBy: [Order!], limit: Int, skip: Int ): [Oracle]!
  searchTopics(searchPhrase: String, filter: TopicFilter, orderBy: [Order!], limit: Int, skip: Int): [Topic]!
  searchOracles(searchPhrase: String, filter: OracleFilter, orderBy: [Order!], limit: Int, skip: Int): [Oracle]!
  allVotes(filter: VoteFilter, orderBy: [Order!], limit: Int, skip: Int): [Vote]!
  resultSets(filter: ResultSetFilter, orderBy: [Order!], limit: Int, skip: Int): [ResultSet]!
  withdraws(filter: WithdrawFilter, orderBy: [Order!], limit: Int, skip: Int): [Withdraw]!
  allTransactions(filter: TransactionFilter, orderBy: [Order!], limit: Int, skip: Int): [Transaction]!
  syncInfo(includeBalance: Boolean): syncInfo!
  addressBalances: [AddressBalance!]
}

type Mutation {
  createTopic(
    senderAddress: String!
    name: String!
    options: [String!]!
    resultSetterAddress: String!
    bettingStartTime: String!
    bettingEndTime: String!
    resultSettingStartTime: String!
    resultSettingEndTime: String!
    amount: String!
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
    token: _TokenType!
    version: Int!
  ): Transaction

  approveSetResult(
    txid: String!
    gasLimit: String!
    gasPrice: String!
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
    token: _TokenType!
    version: Int!
  ): Transaction

  setResult(
    txid: String!
    gasLimit: String!
    gasPrice: String!
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
    token: _TokenType!
    version: Int!
  ): Transaction

  createVote(
    version: Int!
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
    optionIdx: Int!
    amount: String!
  ): Transaction

  finalizeResult(
    version: Int!
    senderAddress: String!
    topicAddress: String!
    oracleAddress: String!
  ): Transaction

  withdraw(
    type: _TransactionType!
    version: Int!
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
