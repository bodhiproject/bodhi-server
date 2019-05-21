const EasyGraphQLTester = require('easygraphql-tester');
const { assert } = require('chai');
const { PAGINATED_BETS } = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('queries', () => {
  describe('bets', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          bets {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the OR filter', async () => {
      const valid = `
        query {
          bets(filter: { OR: [
            { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { txStatus: SUCCESS }
            { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { resultIndex: 0 }
            { eventRound: 0 }
          ] }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txid filter', async () => {
      const valid = `
        query {
          bets(filter: { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txStatus filter', async () => {
      const valid = `
        query {
          bets(filter: { txStatus: SUCCESS }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventAddress filter', async () => {
      const valid = `
        query {
          bets(filter: { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the betterAddress filter', async () => {
      const valid = `
        query {
          bets(filter: { betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the resultIndex filter', async () => {
      const valid = `
        query {
          bets(filter: { resultIndex: 0 }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventRound filter', async () => {
      const valid = `
        query {
          bets(filter: { eventRound: 0 }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });
  });
});
