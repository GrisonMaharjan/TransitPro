const express = require('express');

const router = express.Router();

const { protect } =
require('../middleware/auth.middleware');

const { authorize } =
require('../middleware/role.middleware');

const {
    getAllUsers,
    getAllTransactions
} =
require('../controllers/admin.controller');


// ADMIN DASHBOARD
router.get(
    '/dashboard',

    protect,

    authorize('admin'),

    (req, res) => {

        res.json({
            message: 'Welcome Admin',
            user: req.user
        });

    }

);


// GET ALL USERS
router.get(
    '/users',

    protect,

    authorize('admin'),

    getAllUsers
);


// GET ALL TRANSACTIONS
router.get(
    '/transactions',

    protect,

    authorize('admin'),

    getAllTransactions
);


module.exports = router;