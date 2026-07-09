const express = require('express');

const router = express.Router();

const { protect } =
require('../middleware/auth.middleware');

const {
    getProfile,
    getMyTransactions
} =
require('../controllers/user.controller');

router.get(
    '/profile',
    protect,
    getProfile
);

router.get(
    '/transactions',
    protect,
    getMyTransactions
);

module.exports = router;