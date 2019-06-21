const EasyGraphQLTester = require('easygraphql-tester');
const {
  MULTIPLE_RESULTS_EVENT,
  PAGINATED_EVENTS,
  PAGINATED_BETS,
  PAGINATED_RESULT_SETS,
  PAGINATED_WITHDRAWS,
} = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('graphql/mutations', () => {
  describe('add-pending-event', () => {
    it('General test', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {
        txid: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        ownerAddress: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        name: 'General test',
        results: ['1', '2'],
        numOfResults: 2,
        centralizedOracle: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        betStartTime: 1560965704,
        betEndTime: 1560965704,
        resultSetStartTime: 1560965704,
        resultSetEndTime: 1560965704,
        language: 'en-US',
      });
    });
  });
});
