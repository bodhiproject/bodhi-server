const _ = require('lodash');

const { calculateSyncPercent, getAddressBalances } = require('../sync');
const { getLogger } = require('../utils/logger');
const blockchain = require('../api/blockchain');

const DEFAULT_LIMIT_NUM = 50;
const DEFAULT_SKIP_NUM = 0;

const buildCursorOptions = (cursor, orderBy, limit, skip) => {
  if (!_.isEmpty(orderBy)) {
    const sortDict = {};
    _.forEach(orderBy, (order) => {
      sortDict[order.field] = order.direction === 'ASC' ? 1 : -1;
    });

    cursor.sort(sortDict);
  }

  cursor.limit(limit || DEFAULT_LIMIT_NUM);
  cursor.skip(skip || DEFAULT_SKIP_NUM);

  return cursor;
};

const buildTopicFilters = ({ OR = [], txid, address, status, resultIdx, creatorAddress }) => {
  const filter = (txid || address || status || resultIdx || creatorAddress) ? {} : null;

  if (txid) {
    filter.txid = txid;
  }

  if (address) {
    filter.address = address;
  }

  if (status) {
    filter.status = status;
  }

  if (resultIdx) {
    filter.resultIdx = resultIdx;
  }

  if (creatorAddress) {
    filter.creatorAddress = creatorAddress;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildTopicFilters(OR[i]));
  }
  return filters;
};

const buildOracleFilters = ({ OR = [], txid, address, topicAddress, resultSetterQAddress, excludeResultSetterQAddress, status, token }) => {
  const filter = (
    txid
    || address
    || topicAddress
    || resultSetterQAddress
    || status
    || token
    || excludeResultSetterQAddress
    ) ? {} : null;
  
  if (txid) {
    filter.txid = txid;
  }

  if (address) {
    filter.address = address;
  }

  if (topicAddress) {
    filter.topicAddress = topicAddress;
  }

  if (resultSetterQAddress) {
    filter.resultSetterQAddress = resultSetterQAddress;
  } else if (excludeResultSetterQAddress) {
    filter.resultSetterQAddress = { $nin: excludeResultSetterQAddress };
  }

  if (status) {
    filter.status = status;
  }

  if (token) {
    filter.token = token;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildOracleFilters(OR[i]));
  }

  return filters;
};

const buildSearchOracleFilter = (searchPhrase) => {
  const filterFields = ['name', '_id', 'topicAddress', 'resultSetterAddress', 'resultSetterQAddress'];
  if (!searchPhrase) {
    return [];
  }

  const filters = [];
  const searchRegex = new RegExp(`.*${searchPhrase}.*`);
  for (let i = 0; i < filterFields.length; i++) {
    const filter = {};
    filter[filterFields[i]] = { $regex: searchRegex };
    filters.push(filter);
  }

  return filters;
};

const buildVoteFilters = ({ OR = [], topicAddress, oracleAddress, voterAddress, voterQAddress, optionIdx }) => {
  const filter = (topicAddress || oracleAddress || voterAddress || voterQAddress || optionIdx) ? {} : null;

  if (topicAddress) {
    filter.topicAddress = topicAddress;
  }

  if (oracleAddress) {
    filter.oracleAddress = oracleAddress;
  }

  if (voterAddress) {
    filter.voterAddress = voterAddress;
  }

  if (voterQAddress) {
    filter.voterQAddress = voterQAddress;
  }

  if (optionIdx) {
    filter.optionIdx = optionIdx;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildVoteFilters(OR[i]));
  }
  return filters;
};

const buildWithdrawFilters = ({ OR = [], txid, topicAddress, withdrawerAddress, type }) => {
  const filter = (txid || topicAddress || withdrawerAddress || type) ? {} : null;

  if (txid) {
    filter.txid = txid;
  }

  if (topicAddress) {
    filter.topicAddress = topicAddress;
  }

  if (withdrawerAddress) {
    filter.withdrawerAddress = withdrawerAddress;
  }

  if (type) {
    filter.type = type;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildWithdrawFilters(OR[i]));
  }
  return filters;
};

const buildTransactionFilters = ({ OR = [], type, status, topicAddress, oracleAddress, senderAddress, senderQAddress }) => {
  const filter = (type || status || topicAddress || oracleAddress || senderAddress || senderQAddress) ? {} : null;

  if (type) {
    filter.type = type;
  }

  if (status) {
    filter.status = status;
  }

  if (topicAddress) {
    filter.topicAddress = topicAddress;
  }

  if (oracleAddress) {
    filter.oracleAddress = oracleAddress;
  }

  if (senderAddress) {
    filter.senderAddress = senderAddress;
  }

  if (senderQAddress) {
    filter.senderQAddress = senderQAddress;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildTransactionFilters(OR[i]));
  }
  return filters;
};

module.exports = {
  allTopics: async (root, {
    filter, orderBy, limit, skip,
  }, { db: { Topics } }) => {
    const query = filter ? { $or: buildTopicFilters(filter) } : {};
    let cursor = Topics.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);

    return cursor.exec();
  },

  allOracles: async (root, {
    filter, orderBy, limit, skip,
  }, { db: { Oracles } }) => {
    const query = filter ? { $or: buildOracleFilters(filter) } : {};
    let cursor = Oracles.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  searchOracles: async (root, {
    searchPhrase, orderBy, limit, skip,
  }, { db: { Oracles } }) => {
    const query = searchPhrase ? { $or: buildSearchOracleFilter(searchPhrase) } : {};
    let cursor = Oracles.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  allVotes: async (root, {
    filter, orderBy, limit, skip,
  }, { db: { Votes } }) => {
    const query = filter ? { $or: buildVoteFilters(filter) } : {};
    let cursor = Votes.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  withdraws: async (root, {
    filter, orderBy, limit, skip,
  }, { db: { Withdraws } }) => {
    const query = filter ? { $or: buildVoteFilters(filter) } : {};
    let cursor = Withdraws.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  allTransactions: async (root, {
    filter, orderBy, limit, skip,
  }, { db: { Transactions } }) => {
    const query = filter ? { $or: buildTransactionFilters(filter) } : {};
    let cursor = Transactions.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  syncInfo: async (root, { includeBalance }, { db: { Blocks } }) => {
    let blocks;
    try {
      blocks = await Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
    } catch (err) {
      getLogger().error(`Error querying latest block: ${err.message}`);
    }

    let syncBlockNum;
    let syncBlockTime;
    if (blocks && blocks.length > 0) {
      // Use latest block synced
      syncBlockNum = blocks[0].blockNum;
      syncBlockTime = blocks[0].blockTime;
    } else {
      // Fetch current block from qtum
      syncBlockNum = Math.max(0, await blockchain.getBlockCount());
      const blockHash = await blockchain.getBlockHash({ blockNum: syncBlockNum });
      syncBlockTime = (await blockchain.getBlock({ blockHash })).time;
    }
    const syncPercent = await calculateSyncPercent(syncBlockNum, syncBlockTime);

    let addressBalances = [];
    if (includeBalance || false) {
      addressBalances = await getAddressBalances();
    }

    return {
      syncBlockNum,
      syncBlockTime,
      syncPercent,
      addressBalances,
    };
  },
};
