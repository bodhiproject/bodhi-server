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
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int!
  block: Block
  address: String
  ownerAddress: String!
  version: Int
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
  currentRound: Int
  currentResultIndex: Int
  consensusThreshold: String
  arbitrationEndTime: String
  totalBets: String
  status: EventStatus!
  language: String!
}

type PaginatedEvents {
  totalCount: Int!
  pageInfo: PageInfo
  items: [MultipleResultsEvent]!
}

type Bet {
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int!
  block: Block
  eventAddress: String!
  betterAddress: String!
  resultIndex: Int!
  amount: String!
  eventRound: Int!
}

type PaginatedBets {
  totalCount: Int!
  pageInfo: PageInfo
  items: [Bet]!
}

type ResultSet {
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int!
  block: Block
  eventAddress: String!
  centralizedOracleAddress: String
  resultIndex: Int!
  amount: String!
  eventRound: Int!
}

type PaginatedResultSets {
  totalCount: Int!
  pageInfo: PageInfo
  items: [ResultSet]!
}

type Withdraw {
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int!
  block: Block
  eventAddress: String!
  winnerAddress: String!
  winningAmount: String!
  escrowAmount: String!
}

type PaginatedWithdraws {
  totalCount: Int!
  pageInfo: PageInfo
  items: [Withdraw]!
}

type SyncInfo {
  syncBlockNum: Int
  syncBlockTime: String
  syncPercent: Int
}

type AllStats {
  eventCount: String!
  participantCount: String!
  totalBets: String!
}

type MostBet {
  eventAddress: String!
  betterAddress: String!
  amount: String!
}

type PaginatedMostBets {
  totalCount: Int!
  pageInfo: PageInfo
  items: [MostBet]!
}

type BiggestWinner {
  eventAddress: String!
  betterAddress: String!
  amount: String!
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
  status: EventStatus
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
  events(
    filter: EventFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): PaginatedEvents!

  searchEvents(
    searchPhrase: String,
    filter: EventFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): [MultipleResultsEvent]!

  bets(
    filter: BetFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): [PaginatedBets!

  resultSets(
    filter: ResultSetFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): [PaginatedResultSets]!

  withdraws(
    filter: WithdrawFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): [PaginatedWithdraws]!

  syncInfo(): SyncInfo!

  allStats(
    filter: BetFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): AllStats!

  mostBets(
    filter: BetFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): PaginatedMostBets!

  biggestWinners(
    filter: BetFilter,
    orderBy: [Order!],
    limit: Int,
    skip: Int
  ): [BiggestWinner]!
}

type Mutation {
  addPendingEvent(
    txid: String!
    blockNum: Int!
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
    language: String!
  ): MultipleResultsEvent

  addPendingBet(
    txid: String!
    blockNum: Int!
    eventAddress: String!
    betterAddress: String!
    resultIndex: Int!
    amount: String!
    eventRound: Int!
  ): Bet

  addPendingResultSet(
    txid: String!
    blockNum: Int!
    eventAddress: String!
    centralizedOracleAddress: String!
    resultIndex: Int!
    amount: String!
    eventRound: Int!
  ): ResultSet

  addPendingWithdraw(
    txid: String!
    blockNum: Int!
    eventAddress: String!
    winnerAddress: String!
    winningAmount: String!
    escrowAmount: String!
  ): Withdraw
}

type Subscription {
  onSyncInfo: SyncInfo
}
`;
