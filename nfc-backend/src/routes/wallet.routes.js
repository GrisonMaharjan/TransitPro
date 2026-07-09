const express = require('express');

const router = express.Router();

const { rechargeWallet } = require('../controllers/wallet.controller');

const { protect } = require('../middleware/auth.middleware');

router.post('/recharge', protect, rechargeWallet);

module.exports = router;