const _ = require('lodash');
const BigNumber = require('bignumber.js');
const { calculateSyncPercent } = require('./subscriptions');
const { getInstance } = require('../qclient');
const { SATOSHI_CONVERSION, STATUS, TOKEN } = require('../constants');
const { getLogger } = require('../utils/logger');
const sequentialLoop = require('../utils/sequential-loop');
const Blockchain = require('../api/blockchain');
const Wallet = require('../api/wallet');
const BodhiToken = require('../api/bodhi-token');
const Network = require('../api/network');
const TopicEvent = require('../api/multiple-results-event');

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

const buildTopicFilters = ({ OR = [], txid, address, status, resultIdx, creatorAddress, hashId, language }) => {
  const filter = (txid || address || status || resultIdx || creatorAddress || hashId || language) ? {} : null;

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

  if (hashId) {
    filter.hashId = hashId;
  }

  if (language) {
    filter.language = language;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildTopicFilters(OR[i]));
  }
  return filters;
};

const buildOracleFilters = ({
  OR = [],
  txid,
  address,
  topicAddress,
  resultSetterAddress,
  excludeResultSetterAddress,
  status,
  token,
  hashId,
  language,
}) => {
  const filter = (
    txid
    || address
    || topicAddress
    || resultSetterAddress
    || status
    || token
    || excludeResultSetterAddress
    || hashId
    || language
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

  if (resultSetterAddress) {
    filter.resultSetterAddress = resultSetterAddress;
  } else if (excludeResultSetterAddress) {
    filter.resultSetterAddress = { $nin: excludeResultSetterAddress };
  }

  if (status) {
    filter.status = status;
  }

  if (token) {
    filter.token = token;
  }

  if (hashId) {
    filter.hashId = hashId;
  }

  if (language) {
    filter.language = language;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildOracleFilters(OR[i]));
  }

  return filters;
};

const buildSearchPhrase = (searchPhrase) => {
  const filterFields = ['name', '_id', 'topicAddress', 'resultSetterAddress'];
  if (!searchPhrase) {
    return [];
  }

  const filters = [];
  const searchRegex = new RegExp(`.*${searchPhrase}.*`, 'i');
  for (let i = 0; i < filterFields.length; i++) {
    const filter = {};
    filter[filterFields[i]] = { $regex: searchRegex };
    filters.push(filter);
  }

  return filters;
};

const buildVoteFilters = ({ OR = [], topicAddress, oracleAddress, voterAddress, optionIdx, token }) => {
  const filter = (topicAddress || oracleAddress || voterAddress || optionIdx || token) ? {} : null;

  if (topicAddress) {
    filter.topicAddress = topicAddress;
  }
  if (oracleAddress) {
    filter.oracleAddress = oracleAddress;
  }
  if (voterAddress) {
    filter.voterAddress = voterAddress;
  }
  if (optionIdx) {
    filter.optionIdx = optionIdx;
  }
  if (token) {
    filter.token = token;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildVoteFilters(OR[i]));
  }
  return filters;
};

const buildResultSetFilters = ({ OR = [], txid, fromAddress, topicAddress, oracleAddress, resultIdx }) => {
  const filter = (txid || fromAddress || topicAddress || oracleAddress || resultIdx) ? {} : null;

  if (txid) {
    filter.txid = txid;
  }

  if (fromAddress) {
    filter.fromAddress = fromAddress;
  }

  if (topicAddress) {
    filter.topicAddress = topicAddress;
  }

  if (oracleAddress) {
    filter.oracleAddress = oracleAddress;
  }

  if (resultIdx) {
    filter.resultIdx = resultIdx;
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildResultSetFilters(OR[i]));
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

const buildTransactionFilters = ({ OR = [], txid, type, status, topicAddress, oracleAddress, senderAddress }) => {
  const filter = (txid || type || status || topicAddress || oracleAddress || senderAddress) ? {} : null;

  if (txid) {
    filter.txid = txid;
  }
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

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildTransactionFilters(OR[i]));
  }
  return filters;
};

// Gets the QTUM and BOT balances for all ever used addresses
const getAddressBalances = async () => {
  const addressObjs = [];
  const addressList = [];

  // Get full list of ever used addresses
  try {
    const res = await getInstance().listAddressGroupings();
    // grouping: [["qNh8krU54KBemhzX4zWG9h3WGpuCNYmeBd", 0.01], ["qNh8krU54KBemhzX4zWG9h3WGpuCNYmeBd", 0.02]], [...]
    _.each(res, (grouping) => {
      // addressArrItem: ["qNh8krU54KBemhzX4zWG9h3WGpuCNYmeBd", 0.08164600]
      _.each(grouping, (addressArrItem) => {
        addressObjs.push({
          address: addressArrItem[0],
          qtum: new BigNumber(addressArrItem[1]).multipliedBy(SATOSHI_CONVERSION).toString(10),
        });
        addressList.push(addressArrItem[0]);
      });
    });
  } catch (err) {
    getLogger().error(`getAddressBalances listAddressGroupings: ${err.message}`);
  }

  // Add default address with zero balances if no address was used before and return
  if (_.isEmpty(addressObjs)) {
    const address = await Wallet.getAccountAddress({ accountName: '' });
    addressObjs.push({
      address,
      qtum: '0',
      bot: '0',
    });
    return addressObjs;
  }

  // Get BOT balances of every address
  const batches = _.chunk(addressList, 10);
  await new Promise(async (resolve) => {
    sequentialLoop(batches.length, async (loop) => {
      const promises = [];

      _.map(batches[loop.iteration()], async (address) => {
        promises.push(new Promise(async (getBotBalanceResolve) => {
          let botBalance = new BigNumber(0);

          // Get BOT balance
          try {
            const res = await BodhiToken.balanceOf({
              owner: address,
              senderAddress: address,
            });
            botBalance = res.balance;
          } catch (err) {
            getLogger().error(`getAddressBalances BodhiToken.balanceOf ${address}: ${err.message}`);
          }

          // Update BOT balance for address
          const found = _.find(addressObjs, { address });
          found.bot = botBalance.toString(10);

          getBotBalanceResolve();
        }));
      });

      await Promise.all(promises);
      loop.next();
    }, () => {
      resolve();
    });
  });

  return addressObjs;
};

const getWinnings = async (vote) => {
  const data = await TopicEvent.calculateWinnings({
    contractAddress: vote.topicAddress,
    senderAddress: vote.voterAddress,
  });
  return {
    topicAddress: vote.topicAddress,
    voterAddress: vote.voterAddress,
    amount: {
      bot: data[0],
      qtum: data[1],
    },
  };
};

module.exports = {
  allTopics: async (root, { filter, orderBy, limit, skip }, { db: { Topics } }) => {
    const query = filter ? { $or: buildTopicFilters(filter) } : {};
    let cursor = Topics.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);

    const totalCount = await Topics.count(query);
    let hasNextPage;
    let pageNumber;
    let isPaginated = false;

    if (_.isNumber(limit) && _.isNumber(skip)) {
      isPaginated = true;
      const end = skip + limit;
      hasNextPage = end < totalCount;
      pageNumber = _.toInteger(end / limit); // just in case manually enter not start with new page, ex. limit 20, skip 2
    }
    const topics = await cursor.exec();
    const ret = { totalCount, topics };
    if (isPaginated) {
      ret.pageInfo = {
        hasNextPage,
        pageNumber,
        count: topics.length,
      };
    }
    return ret;
  },

  searchTopics: async (root, { searchPhrase, filter, orderBy, limit, skip }, { db: { Topics } }) => {
    const filters = [];
    if (filter) filters.push({ $or: buildTopicFilters(filter) });
    if (searchPhrase) filters.push({ $or: buildSearchPhrase(searchPhrase) });
    const query = { $and: filters };
    let cursor = Topics.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  allOracles: async (root, { filter, orderBy, limit, skip }, { db: { Oracles } }) => {
    const query = filter ? { $or: buildOracleFilters(filter) } : {};
    let cursor = Oracles.cfind(query);
    const totalCount = await Oracles.count(query);
    let hasNextPage;
    let pageNumber;
    let isPaginated = false;

    if (_.isNumber(limit) && _.isNumber(skip)) {
      isPaginated = true;
      const end = skip + limit;
      hasNextPage = end < totalCount;
      pageNumber = _.toInteger(end / limit); // just in case manually enter not start with new page, ex. limit 20, skip 2
    }
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    const oracles = await cursor.exec();
    const ret = { totalCount, oracles };
    if (isPaginated) {
      ret.pageInfo = {
        hasNextPage,
        pageNumber,
        count: oracles.length,
      };
    }
    return ret;
  },

  searchOracles: async (root, { searchPhrase, filter, orderBy, limit, skip }, { db: { Oracles } }) => {
    const filters = [{ $not: { status: STATUS.WITHDRAW } }];
    if (filter) filters.push({ $or: buildOracleFilters(filter) });
    if (searchPhrase) filters.push({ $or: buildSearchPhrase(searchPhrase) });
    const query = { $and: filters };
    let cursor = Oracles.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  allVotes: async (root, { filter, orderBy, limit, skip }, { db: { Votes } }) => {
    const query = filter ? { $or: buildVoteFilters(filter) } : {};
    let cursor = Votes.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  mostVotes: async (root, { filter, orderBy, limit, skip }, { db: { Votes } }) => {
    const voterFilters = buildVoteFilters(filter);
    if (voterFilters.length !== 1) {
      throw Error('only one event is allowed');
    }

    const query = filter ? { $or: voterFilters } : {};
    const result = await Votes.find(query);

    const accumulated = result.reduce((acc, cur) => {
      const curAmount = new BigNumber(cur.amount);
      if (acc.hasOwnProperty(cur.voterAddress)) {
        acc[cur.voterAddress] = new BigNumber(acc[cur.voterAddress]).plus(curAmount);
      } else {
        acc[cur.voterAddress] = curAmount;
      }
      return acc;
    }, {});

    let votes = Object.keys(accumulated).map(key => ({ voterAddress: key, token: voterFilters[0].token, amount: accumulated[key].toString(10), topicAddress: voterFilters[0].topicAddress }));
    votes.sort((a, b) => b.amount - a.amount);

    const totalCount = votes.length;
    const ret = { totalCount, votes };

    if (_.isNumber(limit) && _.isNumber(skip)) {
      const end = skip + limit;
      const hasNextPage = end < totalCount;
      votes = votes.splice(skip, end);
      const pageNumber = _.toInteger(end / limit); // just in case manually enter not start with new page, ex. limit 20, skip 2
      ret.pageInfo = {
        hasNextPage,
        pageNumber,
        count: votes.length,
      };
      ret.votes = votes;
    }

    return ret;
  },

  winners: async (root, { filter, orderBy, limit, skip }, { db: { Votes } }) => {
    const voterFilters = buildVoteFilters(filter);
    const query = filter ? { $or: voterFilters } : {};
    const result = await Votes.find(query); // get all winning votes
    const filtered = [];
    _.each(result, (vote) => {
      if (!_.find(filtered, {
        voterAddress: vote.voterAddress,
        topicAddress: vote.topicAddress,
      })) {
        filtered.push(vote);
      }
    });
    let winnings = [];
    for (const item of filtered) {
      winnings.push(await getWinnings(item));
    }
    winnings = _.orderBy(winnings, [function (o) { return o.amount.qtum; }], ['desc']);
    return winnings;
  },

  leaderboardStats: async (root, { filter, orderBy, limit, skip }, { db: { Votes, Topics } }) => {
    const result = await Votes.find({});
    let participantsCount = 0;
    let totalQtum = new BigNumber(0);
    let totalBot = new BigNumber(0);
    result.reduce((acc, cur) => {
      const curAmount = new BigNumber(cur.amount);
      if (!acc.hasOwnProperty(cur.voterAddress)) {
        acc[cur.voterAddress] = new BigNumber(0);
        participantsCount++;
      }
      if (cur.token === TOKEN.BOT) {
        totalBot = new BigNumber(totalBot).plus(curAmount);
      } else {
        totalQtum = new BigNumber(totalQtum).plus(curAmount);
      }
      return acc;
    }, {});
    return {
      eventCount: Topics.count({}),
      participantsCount,
      totalQtum: totalQtum.toString(10),
      totalBot: totalBot.toString(10),
    };
  },

  resultSets: async (root, { filter, orderBy, limit, skip }, { db: { ResultSets } }) => {
    const query = filter ? { $or: buildResultSetFilters(filter) } : {};
    let cursor = ResultSets.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  withdraws: async (root, { filter, orderBy, limit, skip }, { db: { Withdraws } }) => {
    const query = filter ? { $or: buildWithdrawFilters(filter) } : {};
    let cursor = Withdraws.cfind(query);
    cursor = buildCursorOptions(cursor, orderBy, limit, skip);
    return cursor.exec();
  },

  allTransactions: async (root, { filter, orderBy, limit, skip }, { db: { Transactions } }) => {
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
      syncBlockNum = Math.max(0, await Blockchain.getBlockCount());
      const blockHash = await Blockchain.getBlockHash({ blockNum: syncBlockNum });
      syncBlockTime = (await Blockchain.getBlock({ blockHash })).time;
    }
    const syncPercent = await calculateSyncPercent(syncBlockNum, syncBlockTime);
    const peerNodeCount = await Network.getPeerNodeCount();

    let addressBalances = [];
    if (includeBalance || false) {
      addressBalances = await getAddressBalances();
    }

    return {
      syncBlockNum,
      syncBlockTime,
      syncPercent,
      peerNodeCount,
      addressBalances,
    };
  },

  // Gets the QTUM and BOT balances for all ever used addresses
  addressBalances: async () => getAddressBalances(),
};
