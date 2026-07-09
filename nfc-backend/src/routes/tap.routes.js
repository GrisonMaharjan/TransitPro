const express = require('express');
const router = express.Router();

const { tap } = require('../controllers/tap.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, tap);

module.exports = router;