const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
    getAllDrivers,
    getDriverById
} = require('../controllers/driver.controller');

router.get('/', protect, authorize('admin'), getAllDrivers);
router.get('/:id', protect, authorize('admin'), getDriverById);

module.exports = router;
