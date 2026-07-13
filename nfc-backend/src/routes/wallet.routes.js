const express = require('express');

const router = express.Router();

const {
    rechargeWallet,
    getWalletBalance
} = require('../controllers/wallet.controller');

const { protect } = require('../middleware/auth.middleware');

router.get('/balance', protect, getWalletBalance);
router.post('/recharge', protect, rechargeWallet);

module.exports = router;
