const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const {

    getAllStops,
    getStopById,
    createStop,
    updateStop,
    deleteStop

} = require('../controllers/stop.controller');

// Public (Logged In Users)

router.get(
    '/',
    protect,
    getAllStops
);

router.get(
    '/:id',
    protect,
    getStopById
);

// Admin Only

router.post(
    '/',
    protect,
    authorize('admin'),
    createStop
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    updateStop
);

router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteStop
);

module.exports = router;