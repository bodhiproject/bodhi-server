const { sum, fill, each, isNull } = require('lodash');
const Queries = require('./queries');
const Mutations = require('./mutations');
const { TX_TYPE, TX_STATUS } = require('../constants');
const pubsub = require('../route/pubsub');
const DBHelper = require('../db/db-helper');
const { sumBN, sumArrayBN } = require('../utils/web3-utils');
const { toLowerCase } = require('../utils/index');

/* eslint-disable object-curly-newline */
module.exports = {
  Query: Queries,
  Mutation: Mutations,
  Subscription: {
    onSyncInfo: { subscribe: () => pubsub.asyncIterator('onSyncInfo') },
  },

  Transaction: {
    __resolveType: (tx) => {
      switch (tx.txType) {
        case TX_TYPE.CREATE_EVENT: return 'MultipleResultsEvent';
        case TX_TYPE.BET: return 'Bet';
        case TX_TYPE.RESULT_SET: return 'ResultSet';
        case TX_TYPE.VOTE: return 'Bet';
        case TX_TYPE.WITHDRAW: return 'Withdraw';
        default: return null;
      }
    },
  },

  MultipleResultsEvent: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    pendingTxs: async ({ address }, args, { pendingTxsAddress }) => {
      if (pendingTxsAddress) {
        const bet = await DBHelper.countBet({
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          betterAddress: pendingTxsAddress,
        });
        const resultSet = await DBHelper.countResultSet({
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          centralizedOracleAddress: pendingTxsAddress,
        });
        const withdraw = await DBHelper.countWithdraw({
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          winnerAddress: pendingTxsAddress,
        });
        return {
          bet,
          resultSet,
          withdraw,
          total: sum([bet, resultSet, withdraw]),
        };
      }
      return null;
    },
    roundBets: async (
      { address, currentRound, numOfResults },
      args,
      { includeRoundBets, roundBetsAddress, includeBetRoundBets },
    ) => {
      if (includeRoundBets) {
        // Fetch all bets for this round
        const bets = await DBHelper.findBet({
          txStatus: TX_STATUS.SUCCESS,
          eventAddress: address,
          eventRound: currentRound,
        });


        // Sum all bets by index
        const rounds = fill(Array(numOfResults), '0');
        const userRound = fill(Array(numOfResults), '0');
        each(bets, (bet) => {
          if (toLowerCase(roundBetsAddress) === bet.betterAddress) {
            userRound[bet.resultIndex] = sumBN(userRound[bet.resultIndex], bet.amount)
              .toString(10);
          }
          rounds[bet.resultIndex] = sumBN(rounds[bet.resultIndex], bet.amount)
            .toString(10);
        });

        const betRound = fill(Array(numOfResults), '0');
        const userBetRound = fill(Array(numOfResults), '0');
        if (includeBetRoundBets) {
          const bets = await DBHelper.findBet({
            txStatus: TX_STATUS.SUCCESS,
            eventAddress: address,
            eventRound: 0,
          });

          each(bets, (bet) => {
            if (toLowerCase(roundBetsAddress) === bet.betterAddress) {
              userBetRound[bet.resultIndex] = sumBN(userBetRound[bet.resultIndex], bet.amount)
                .toString(10);
            }
            betRound[bet.resultIndex] = sumBN(betRound[bet.resultIndex], bet.amount)
              .toString(10);
          });
        }

        // Add result set amount if round 1
        if (currentRound === 1) {
          const resultSet = await DBHelper.findOneResultSet({
            txStatus: TX_STATUS.SUCCESS,
            eventAddress: address,
            eventRound: 0,
          });

          if (!isNull(resultSet)) {
            if (toLowerCase(roundBetsAddress) === resultSet.centralizedOracleAddress) {
              userRound[resultSet.resultIndex] = sumBN(userRound[resultSet.resultIndex], resultSet.amount)
                .toString(10);
            }
            rounds[resultSet.resultIndex] = sumBN(
              rounds[resultSet.resultIndex],
              resultSet.amount,
            ).toString(10);
          }
        }
        return {
          totalRoundBets: rounds,
          userRoundBets: userRound,
          totalBetRoundBets: betRound,
          userBetRoundBets: userBetRound,
        };
      }
      return null;
    },
    previousConsensusThreshold: async ({ address, currentRound }) => {
        if (currentRound >= 1) {
          const resultSet = await DBHelper.findOneResultSet({
            txStatus: TX_STATUS.SUCCESS,
            eventAddress: address,
            eventRound: currentRound - 1,
          });
          return resultSet.amount
        }
        return null
    },
    totalBets: async ({ address }) => {
      const bets = await DBHelper.findBet({
        txStatus: TX_STATUS.SUCCESS,
        eventAddress: address,
      });
      const amounts = [];
      each(bets, bet => amounts.push(bet.amount));

      // Add result set amount
      const resultSet = await DBHelper.findOneResultSet({
        txStatus: TX_STATUS.SUCCESS,
        eventAddress: address,
        eventRound: 0,
      });
      if (!isNull(resultSet)) amounts.push(resultSet.amount);

      return sumArrayBN(amounts).toString(10);
    },
  },

  Bet: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    resultName: async ({ eventAddress, resultIndex }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.results[resultIndex];
    },
    eventName: async ({ eventAddress }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.name;
    },
  },

  ResultSet: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    resultName: async ({ eventAddress, resultIndex }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.results[resultIndex];
    },
    eventName: async ({ eventAddress }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.name;
    },
  },

  Withdraw: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    eventName: async ({ eventAddress }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.name;
    },
  },
};
/* eslint-enable object-curly-newline */
