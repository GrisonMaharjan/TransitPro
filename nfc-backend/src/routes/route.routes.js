const express = require('express');

const router = express.Router();

const {

    createRoute,
    getRoutes,
    getRouteById,
    updateRoute,
    deleteRoute

} = require('../controllers/route.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// ==========================
// Passenger + Admin
// ==========================

router.get(
    '/',
    protect,
    getRoutes
);

router.get(
    '/:id',
    protect,
    getRouteById
);

// ==========================
// Admin Only
// ==========================

router.post(
    '/',
    protect,
    authorize('admin'),
    createRoute
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    updateRoute
);

router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteRoute
);

module.exports = router;