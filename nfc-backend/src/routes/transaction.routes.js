const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
    getAllTransactions,
    getMyTransactions
} = require('../controllers/transaction.controller');

router.get('/', protect, getMyTransactions);
router.get('/all', protect, authorize('admin'), getAllTransactions);

module.exports = router;
