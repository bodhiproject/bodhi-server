const { Router } = require('express');
const { onRequestSuccess, onRequestError } = require('./utils');
const AddressNameServiceApi = require('../api/address-name-service');

const router = Router();

router.get('/resolveAddress', (req, res, next) => {
  AddressNameServiceApi.resolveAddress(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
