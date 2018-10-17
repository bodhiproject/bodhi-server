const _ = require('lodash');

const Queries = require('./queries');
const Mutations = require('./mutations');
const { TOKEN, STATUS, PHASE, TX_TYPE } = require('../constants');
const pubsub = require('../route/pubsub');

/**
 * Takes an oracle object and returns which phase it is in.
 * @param {oracle} oracle
 */
const getPhase = ({ token, status }) => {
  const [BOT, QTUM] = [token === TOKEN.BOT, token === TOKEN.QTUM];

  if (QTUM && [STATUS.VOTING, STATUS.CREATED].includes(status)) return PHASE.BETTING;
  if (BOT && status === STATUS.VOTING) return PHASE.VOTING;
  if (QTUM && [STATUS.WAITRESULT, STATUS.OPENRESULTSET].includes(status)) return PHASE.RESULT_SETTING;
  if ((BOT || QTUM) && status === STATUS.PENDING) return PHASE.PENDING;
  if (BOT && status === STATUS.WAITRESULT) return PHASE.FINALIZING;
  if ((BOT || QTUM) && status === STATUS.WITHDRAW) return PHASE.WITHDRAWING;
  throw Error(`Invalid Phase determined by these -> TOKEN: ${token} STATUS: ${status}`);
};

module.exports = {
  Query: Queries,
  Mutation: Mutations,

  Topic: {
    oracles: ({ address }, data, { db: { Oracles } }) => Oracles.cfind({ topicAddress: address }).sort({ blockNum: -1 }).exec(),
    transactions: async ({ address }, data, { db: { Transactions } }) => {
      const { WITHDRAW, WITHDRAWESCROW } = TX_TYPE;
      const types = [{ type: WITHDRAWESCROW }, { type: WITHDRAW }];
      return Transactions.find({ topicAddress: address, $or: types });
    },
  },

  Oracle: {
    transactions: (oracle, data, { db: { Transactions } }) => {
      const calculatedPhase = getPhase(oracle);
      let types = [];
      switch (calculatedPhase) {
        case PHASE.PENDING:
          // Oracles in PENDING phase don't have any transactions to query
          return [];
        case PHASE.BETTING:
          types = [{ type: TX_TYPE.BET }, { type: TX_TYPE.CREATEEVENT }, { type: TX_TYPE.APPROVECREATEEVENT }];
          break;
        case PHASE.RESULT_SETTING:
          types = [{ type: TX_TYPE.SETRESULT }, { type: TX_TYPE.APPROVESETRESULT }];
          break;
        case PHASE.VOTING:
          types = [{ type: TX_TYPE.VOTE }, { type: TX_TYPE.APPROVEVOTE }];
          break;
        case PHASE.FINALIZING:
          types = [{ type: TX_TYPE.FINALIZERESULT }];
          break;
        case PHASE.WITHDRAWING:
          types = [{ type: TX_TYPE.WITHDRAW }];
          break;
        default:
          throw Error(`Invalid phase: ${calculatedPhase}`);
      }
      return Transactions.find({ oracleAddress: oracle.address, $or: types });
    },
  },

  Vote: {
    block: ({ blockNum }, data, { db: { Blocks } }) => Blocks.cfind({ blockNum }).exec(),
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
    onSyncInfo: { subscribe: () => pubsub.asyncIterator('onSyncInfo') },
    onApproveSuccess: { subscribe: () => pubsub.asyncIterator('onApproveSuccess') },
  },
};
