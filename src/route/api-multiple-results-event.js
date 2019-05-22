const { Router } = require('express');
const { onRequestSuccess, onRequestError, validateQueryParams } = require('./utils');
const MultipleResultsEventApi = require('../api/multiple-results-event');

const router = Router();

router.get('/calculate-winnings', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress', 'address'])) return;

  MultipleResultsEventApi.calculateWinnings(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/version', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.version(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/round', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.currentRound(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/result-index', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.currentResultIndex(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/consensus-threshold', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.currentConsensusThreshold(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/arbitration-end-time', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.currentArbitrationEndTime(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/event-metadata', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.eventMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/centralized-metadata', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.centralizedMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/config-metadata', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.configMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/total-bets', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress'])) return;

  MultipleResultsEventApi.totalBets(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/did-withdraw', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress', 'address'])) return;

  MultipleResultsEventApi.didWithdraw(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/did-withdraw-escrow', (req, res, next) => {
  if (!validateQueryParams(req, res, ['eventAddress', 'address'])) return;

  MultipleResultsEventApi.didWithdrawEscrow(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
