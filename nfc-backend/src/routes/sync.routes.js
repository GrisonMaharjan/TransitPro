const express = require('express');

const router = express.Router();

const { syncTransactions } = require('../controllers/sync.controller');

router.post('/', syncTransactions);

module.exports = router;