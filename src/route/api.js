const { Router } = require('express');

const MultipleResultsEvent = require('../api/multiple-results-event');

const router = Router();

/* MultipleResultsEvent */
router.get('/calculate-winnings', (req, res, next) => {
  if (!validateQueryParams(['eventAddress', 'address'])) return;

  MultipleResultsEvent.calculateWinnings(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/version', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.version(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/round', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentRound(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/result-index', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentResultIndex(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/consensus-threshold', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentConsensusThreshold(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/arbitration-end-time', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentArbitrationEndTime(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/event-metadata', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.eventMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/centralized-metadata', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.centralizedMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/config-metadata', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.configMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/total-bets', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.totalBets(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/did-withdraw', (req, res, next) => {
  if (!validateQueryParams(['eventAddress', 'address'])) return;

  MultipleResultsEvent.didWithdraw(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/did-withdraw-escrow', (req, res, next) => {
  if (!validateQueryParams(['eventAddress', 'address'])) return;

  MultipleResultsEvent.didWithdrawEscrow(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
