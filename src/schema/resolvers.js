const _ = require('lodash');

const Queries = require('./queries');
const Mutations = require('./mutations');
const pubsub = require('../pubsub');

/**
 * Takes an oracle object and returns which phase it is in.
 * @param {oracle} oracle
 */
const getPhase = ({ token, status }) => {
  const [BOT, QTUM] = [token === 'BOT', token === 'QTUM'];
  if (QTUM && ['VOTING', 'CREATED'].includes(status)) return 'betting';
  if (BOT && status === 'VOTING') return 'voting';
  if (QTUM && ['WAITRESULT', 'OPENRESULTSET'].includes(status)) return 'resultSetting';
  if (BOT && status === 'WAITRESULT') return 'finalizing';
  if (((BOT || QTUM) && status === 'WITHDRAW') || (QTUM && status === 'PENDING')) return 'withdrawing';
  throw Error(`Invalid Phase determined by these -> TOKEN: ${token} STATUS: ${status}`);
};

module.exports = {
  Query: Queries,
  Mutation: Mutations,

  Topic: {
    oracles: ({ address }, data, { db: { Oracles } }) => Oracles.find({ topicAddress: address }),
    transactions: async ({ address }, data, { db: { Transactions } }) => {
      const types = [{ type: 'WITHDRAWESCROW' }, { type: 'WITHDRAW' }];
      return Transactions.find({ topicAddress: address, $or: types });
    },
  },

  Oracle: {
    transactions: (oracle, data, { db: { Transactions } }) => {
      const phase = getPhase(oracle);
      let types = [];
      switch (phase) {
        case 'betting':
          types = [{ type: 'BET' }, { type: 'CREATEEVENT' }, { type: 'APPROVECREATEEVENT' }];
          break;
        case 'voting':
          types = [{ type: 'VOTE' }, { type: 'APPROVEVOTE' }];
          break;
        case 'resultSetting':
          types = [{ type: 'SETRESULT' }, { type: 'APPROVESETRESULT' }];
          break;
        case 'finalizing':
          types = [{ type: 'FINALIZERESULT' }];
          break;
        case 'withdrawing':
          types = [{ type: 'WITHDRAW' }];
          break;
        default:
          throw Error('invalid phase');
      }
      return Transactions.find({ oracleAddress: oracle.address, $or: types });
    },
  },

  Transaction: {
    topic: async ({ topicAddress }, data, { db: { Topics } }) => {
      if (_.isEmpty(topicAddress)) {
        return null;
      }

      const topics = await Topics.find({ address: topicAddress });
      if (!_.isEmpty(topics)) {
        return topics[0];
      }
      return null;
    },
  },

  Subscription: {
    onSyncInfo: {
      subscribe: () => pubsub.asyncIterator('onSyncInfo'),
    },
  },
};
