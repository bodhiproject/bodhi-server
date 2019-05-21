const EasyGraphQLTester = require('easygraphql-tester');
const { assert } = require('chai');
const { PAGE_INFO, BLOCK, TX_RECEIPT } = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('resolvers', () => {
  describe('Query', () => {
    describe('bets', () => {
      it('should return the query if valid', async () => {
        const valid = `
          query {
            bets {
              totalCount
              ${PAGE_INFO}
              items {
                txType
                txid
                txStatus
                ${TX_RECEIPT}
                blockNum
                ${BLOCK}
                eventAddress
                betterAddress
                resultIndex
                amount
                eventRound
                resultName
              }
            }
          }
        `;
        tester.test(true, valid);
      });
    });
  });
});
