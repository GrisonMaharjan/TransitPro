const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { encrypt } = require('../utils/encryption');
const { busAuthMiddleware } = require('../middleware/bus.auth.middleware');

// Protect tools routes
router.use(busAuthMiddleware);

/**
 * Route to encrypt NFC ID before writing to card.
 * Verifies if the passenger (User) exists before encrypting.
 * It checks both userId and nfcUid to find the passenger.
 */
router.post('/encrypt-nfcid', async (req, res) => {
    const { nfcId } = req.body; // This is the ID entered in the text box (usually UserId)

    if (!nfcId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Search for the passenger using either their human-readable UserId or their plain NFCID
        const passenger = await User.findOne({
            $or: [
                { userId: nfcId },
                { nfcUid: nfcId }
            ]
        });

        if (!passenger) {
            console.log(`❌ Encryption Rejected: ID ${nfcId} not found in database.`);
            return res.status(404).json({ message: 'Passenger not registered. Please register the user first.' });
        }

        // We always encrypt the nfcUid for the physical card
        const encryptedId = encrypt(passenger.nfcUid);

        console.log(`✅ Passenger Verified: ${passenger.name}`);
        console.log(`🔒 Encrypting NFCID [${passenger.nfcUid}] for card writing.`);

        res.status(200).json({ encryptedId });
    } catch (error) {
        console.error('Encryption system error:', error.message);
        res.status(500).json({ message: 'Internal server error during validation', error: error.message });
    }
});

module.exports = router;
