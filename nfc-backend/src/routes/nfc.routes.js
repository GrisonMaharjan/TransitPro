const express = require('express');

const router = express.Router();

const { linkCard } = require('../controllers/nfc.controller');

const { protect } = require('../middleware/auth.middleware');

router.post('/link', protect, linkCard);

module.exports = router;