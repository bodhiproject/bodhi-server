const { Router } = require('express');
const { onRequestSuccess, onRequestError } = require('./utils');
const LogApi = require('../api/log');

const router = Router();

router.post('/client-error', (req, res, next) => {
  LogApi.logClientError(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
