const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus
} = require('../controllers/bus.controller');

router.get('/', protect, getAllBuses);
router.get('/:id', protect, getBusById);
router.post('/', protect, authorize('admin'), createBus);
router.put('/:id', protect, authorize('admin'), updateBus);
router.delete('/:id', protect, authorize('admin'), deleteBus);

module.exports = router;
