const EasyGraphQLTester = require('easygraphql-tester');
const {
  MULTIPLE_RESULTS_EVENT,
  PAGINATED_EVENTS,
  PAGINATED_BETS,
  PAGINATED_RESULT_SETS,
  PAGINATED_WITHDRAWS,
  BET,
  RESULT_SET,
  WITHDRAW,
} = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('graphql/mutations', () => {
  describe('add-pending-event', () => {
    it('It passes all arguments', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {});
    });

    it('It should fail if txid missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if ownerAddress missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if name missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if results missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if numOfResults missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracle missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if betEndTime missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultSetStartTime missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if language missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: null
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: 1
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is an object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if ownerAddress is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: null
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if ownerAddress is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: 1
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if ownerAddress is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if ownerAddress is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if name is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: null
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if name is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: 1
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if name is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: ["a"]
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if name is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: {id: "a"}
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if results is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: null
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if results is number array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: [1, 2]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if results is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: {id: "1"}
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if numOfResults is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: null
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if numOfResults is string', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: "2"
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if numOfResults is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: ["2"]
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if numOfResults is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: {id: "2"}
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracle is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: null
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracle is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: 1
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracle is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracle is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });
  });

  describe('add-pending-bet', () => {
    it('It should pass if passing all correct arguments', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(true, valid, {});
    });

    it('It should fail if txid is missing', async () => {
      const valid = `
        mutation {
          addPendingBet(
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is null', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: null
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is number', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: 1
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is array', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is object', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is missing', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is null', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: null
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is array', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is object', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is number', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: 1
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if betterAddress is missing', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if betterAddress is null', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: null
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if betterAddress is number', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: 1
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if betterAddress is array', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if betterAddress is object', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is missing', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is null', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: null
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is string', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: "2"
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is array', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: [2]
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is object', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: {id:2}
            amount: "1000000"
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is missing', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is null', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: null
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is number', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: 100000
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is array', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: ["100000"]
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is object', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: {id:"100000"}
            eventRound: 2
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is missing', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is null', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: null
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is string', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: "2"
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is array', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: [2]
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is object', async () => {
      const valid = `
        mutation {
          addPendingBet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: {id:2}
          ) {
            ${BET}
          }
        }
      `;
      tester.test(false, valid, {});
    });
  });

  describe('add-pending-result-set', () => {
    it('It should pass if passing all arguments correctly', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: 0
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(true, valid, {});
    });

    it('It should fail if txid is missing', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is null', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: null
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is number', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: 1
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is array', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is object', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is missing', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is null', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: null
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is array', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is object', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is number', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: 1
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracleAddress is missing', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracleAddress is null', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: null
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracleAddress is number', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: 1
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracleAddress is array', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if centralizedOracleAddress is object', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            resultIndex: 2
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is missing', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is null', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: null
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is string', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: "2"
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is array', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: [2]
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultIndex is object', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: {id:2}
            amount: "1000000"
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is missing', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is null', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: null
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is number', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: 100000
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is array', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: ["100000"]
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if amount is object', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: {id:"100000"}
            eventRound: 2
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is missing', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is null', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: null
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is string', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: "2"
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is array', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: [2]
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventRound is object', async () => {
      const valid = `
        mutation {
          addPendingResultSet(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultIndex: 2
            amount: "100000"
            eventRound: {id:2}
          ) {
            ${RESULT_SET}
          }
        }
      `;
      tester.test(false, valid, {});
    });
  });

  describe('add-pending-withdraw', () => {
    it('It should pass if passing all arguments correctly', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(true, valid, {});
    });

    it('It should fail if txid is missing', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is null', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: null
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is number', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: 1
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is array', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is object', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is missing', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is null', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: null
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is array', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is object', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if eventAddress is number', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: 1
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winnerAddress is missing', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winnerAddress is null', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: null
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winnerAddress is number', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: 1
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winnerAddress is array', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winnerAddress is object', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            winningAmount: "100000"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winningAmount is missing', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winningAmount is null', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: null
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winningAmount is number', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: 100000
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winningAmount is array', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: ["100000"]
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if winningAmount is object', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: {id:"100000"}
            escrowAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if escrowAmount is missing', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winningAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if escrowAmount is null', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            escrowAmount: null
            winningAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if escrowAmount is number', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            escrowAmount: 100000
            winningAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if escrowAmount is array', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            escrowAmount: ["100000"]
            winningAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if escrowAmount is object', async () => {
      const valid = `
        mutation {
          addPendingWithdraw(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            escrowAmount: {id:"100000"}
            winningAmount: "100000"
          ) {
            ${WITHDRAW}
          }
        }
      `;
      tester.test(false, valid, {});
    });
  });
});
