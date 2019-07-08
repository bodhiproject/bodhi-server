module.exports = `

enum OrderDirection {
  DESC
  ASC
}

enum EventStatus {
  CREATED
  PRE_BETTING
  BETTING
  PRE_RESULT_SETTING
  ORACLE_RESULT_SETTING
  OPEN_RESULT_SETTING
  ARBITRATION
  WITHDRAWING
}

enum TransactionType {
  CREATE_EVENT
  BET
  RESULT_SET
  VOTE
  WITHDRAW
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAIL
}

interface Transaction {
  txType: TransactionType!
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
}

type Block {
  blockNum: Int!
  blockTime: Int!
}

type PendingTransactions {
  bet: Int!
  resultSet: Int!
  withdraw: Int!
  total: Int!
}

type TransactionReceipt {
  status: Boolean
  blockHash: String
  blockNumber: Int
  transactionHash: String!
  from: String!
  to: String
  contractAddress: String
  cumulativeGasUsed: Int
  gasUsed: Int!
  gasPrice: String
}

type PageInfo {
  hasNextPage: Boolean!
  pageNumber: Int!
  count: Int!
  nextTransactionSkips: NextTransactionSkips
}

type NextTransactionSkips {
  nextEventSkip: Int!
  nextBetSkip: Int!
  nextResultSetSkip: Int!
  nextWithdrawSkip: Int!
}

type MultipleResultsEvent implements Transaction {
  txType: TransactionType!
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  address: String
  ownerAddress: String!
  version: Int
  name: String!
  results: [String!]!
  numOfResults: Int!
  centralizedOracle: String!
  betStartTime: Int
  betEndTime: Int!
  resultSetStartTime: Int!
  resultSetEndTime: Int
  escrowAmount: String
  arbitrationLength: Int
  arbitrationRewardPercentage: Int
  thresholdPercentIncrease: String
  currentRound: Int
  currentResultIndex: Int
  consensusThreshold: String
  previousConsensusThreshold: String
  arbitrationEndTime: Int
  status: EventStatus!
  language: String!
  pendingTxs: PendingTransactions
  roundBets: RoundBets
  totalBets: String
  withdrawnList: [String]
}

type RoundBets {
  singleTotalRoundBets: [[String!]]
  singleUserRoundBets: [[String!]]
}

type PaginatedEvents {
  totalCount: Int!
  pageInfo: PageInfo
  items: [MultipleResultsEvent]!
}

type Bet implements Transaction {
  txType: TransactionType!
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  eventAddress: String!
  betterAddress: String!
  resultIndex: Int!
  amount: String!
  eventRound: Int!
  resultName: String
  eventName: String
}

type PaginatedBets {
  totalCount: Int!
  pageInfo: PageInfo
  items: [Bet]!
}

type ResultSet implements Transaction {
  txType: TransactionType!
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  eventAddress: String!
  centralizedOracleAddress: String
  resultIndex: Int!
  amount: String!
  eventRound: Int!
  nextConsensusThreshold: String
  nextArbitrationEndTime: Int
  resultName: String
  eventName: String
}

type PaginatedResultSets {
  totalCount: Int!
  pageInfo: PageInfo
  items: [ResultSet]!
}

type Withdraw implements Transaction {
  txType: TransactionType!
  txid: String!
  txStatus: TransactionStatus!
  txReceipt: TransactionReceipt
  blockNum: Int
  block: Block
  eventAddress: String!
  winnerAddress: String!
  winningAmount: String!
  escrowWithdrawAmount: String!
  eventName: String
}

type PaginatedWithdraws {
  totalCount: Int!
  pageInfo: PageInfo
  items: [Withdraw]!
}

type PaginatedTransactions {
  totalCount: Int!
  pageInfo: PageInfo
  items: [Transaction]!
}

type SyncInfo {
  syncBlockNum: Int
  syncBlockTime: Int
  syncPercent: Int
}

type TotalResultBets {
  totalBets: [String]!
  betterBets: [String]
  totalVotes: [String]
  betterVotes: [String]
}

type AllStats {
  eventCount: String!
  participantCount: String!
  totalBets: String!
}

type MostBet {
  eventAddress: String
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

type PaginatedBiggestWinner {
  totalCount: Int!
  pageInfo: PageInfo
  items: [BiggestWinner]!
}

type LeaderboardEntry {
  eventAddress: String
  userAddress: String!
  investments: String!
  winnings: String!
  returnRatio: Float!
}

type PaginatedLeaderboardEntry {
  totalCount: Int!
  pageInfo: PageInfo
  items: [LeaderboardEntry]!
}

input Order {
  field: String!
  direction: OrderDirection!
}

input LeaderboardEntryFilter {
  userAddress: String
  eventAddress: String
}

input EventFilter {
  OR: [EventFilter!]
  txid: String
  txStatus: TransactionStatus
  address: String
  ownerAddress: String
  versions: [Int]
  centralizedOracle: String
  currentRound: Int
  currentResultIndex: Int
  status: EventStatus
  language: String
  excludeCentralizedOracle: String
}

input SearchEventsFilter {
  OR: [SearchEventsFilter!]
  txStatus: TransactionStatus
  version: Int
  status: EventStatus
  language: String
}

input WithdrawableEventFilter {
  versions: [Int]
  language: String
  withdrawerAddress: String!
}

input BetFilter {
  OR: [BetFilter!]
  txid: String
  txStatus: TransactionStatus
  eventAddress: String
  betterAddress: String
  resultIndex: Int
  eventRound: Int
}

input ResultSetFilter {
  OR: [ResultSetFilter!]
  txid: String
  txStatus: TransactionStatus
  eventAddress: String
  centralizedOracleAddress: String
  resultIndex: Int
  eventRound: Int
}

input WithdrawFilter {
  OR: [WithdrawFilter!]
  txid: String
  txStatus: TransactionStatus
  eventAddress: String
  winnerAddress: String
}

input TransactionFilter {
  eventAddress: String
  transactorAddress: String
  txStatus: TransactionStatus
}

input TotalResultBetsFilter {
  eventAddress: String!
  betterAddress: String
}

input TransactionSkips {
  eventSkip: Int!
  betSkip: Int!
  resultSetSkip: Int!
  withdrawSkip: Int!
}

type Query {
  events(
    filter: EventFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
    pendingTxsAddress: String
    includeRoundBets: Boolean
    roundBetsAddress: String
  ): PaginatedEvents!

  searchEvents(
    filter: SearchEventsFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
    searchPhrase: String
    includeRoundBets: Boolean
    roundBetsAddress: String
  ): [MultipleResultsEvent]!

  withdrawableEvents(
    filter: WithdrawableEventFilter!
    orderBy: [Order!]
    limit: Int
    skip: Int
    includeRoundBets: Boolean
    roundBetsAddress: String
  ): PaginatedEvents!

  bets(
    filter: BetFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedBets!

  resultSets(
    filter: ResultSetFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedResultSets!

  withdraws(
    filter: WithdrawFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedWithdraws!

  transactions(
    filter: TransactionFilter
    limit: Int
    skip: Int
    transactionSkips: TransactionSkips
  ): PaginatedTransactions!

  syncInfo: SyncInfo!

  totalResultBets(
    filter: TotalResultBetsFilter
  ): TotalResultBets!

  allStats: AllStats!

  mostBets(
    filter: BetFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedMostBets!

  biggestWinners(
    filter: BetFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedBiggestWinner!

  eventLeaderboardEntries(
    filter: LeaderboardEntryFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedLeaderboardEntry!

  globalLeaderboardEntries(
    filter: LeaderboardEntryFilter
    orderBy: [Order!]
    limit: Int
    skip: Int
  ): PaginatedLeaderboardEntry!
}

type Mutation {
  addPendingEvent(
    txid: String!
    ownerAddress: String!
    name: String!
    results: [String!]!
    numOfResults: Int!
    centralizedOracle: String!
    betEndTime: Int!
    resultSetStartTime: Int!
    language: String!
  ): MultipleResultsEvent!

  addPendingBet(
    txid: String!
    eventAddress: String!
    betterAddress: String!
    resultIndex: Int!
    amount: String!
    eventRound: Int!
  ): Bet!

  addPendingResultSet(
    txid: String!
    eventAddress: String!
    centralizedOracleAddress: String!
    resultIndex: Int!
    amount: String!
    eventRound: Int!
  ): ResultSet!

  addPendingWithdraw(
    txid: String!
    eventAddress: String!
    winnerAddress: String!
    winningAmount: String!
    escrowAmount: String!
  ): Withdraw!
}

type Subscription {
  onSyncInfo: SyncInfo
}
`;
