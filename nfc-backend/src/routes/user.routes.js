const express = require('express');

const router = express.Router();

const { protect } =
require('../middleware/auth.middleware');

const {
    getProfile,
    getMyTransactions,
    updateProfile,
    changePassword,
    toggleNfcBlock,
    getNfcStats
} =
require('../controllers/user.controller');

router.get(
    '/profile',
    protect,
    getProfile
);

router.get(
    '/nfc-stats',
    protect,
    getNfcStats
);

router.post(
    '/toggle-nfc-block',
    protect,
    toggleNfcBlock
);

router.get(
    '/transactions',
    protect,
    getMyTransactions
);

router.put(
    '/profile',
    protect,
    updateProfile
);

router.put(
    '/change-password',
    protect,
    changePassword
);

module.exports = router;
