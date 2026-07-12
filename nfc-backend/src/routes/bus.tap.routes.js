const express = require('express');
const router = express.Router();
const BusTap = require('../models/bus.tap.model');
const BusTrip = require('../models/bus.trip.model');
const User = require('../models/user.model');
const Fare = require('../models/fare.model');
const { busAuthMiddleware } = require('../middleware/bus.auth.middleware');
const { decrypt } = require('../utils/encryption');

// Protect all tap routes with Bus authentication
router.use(busAuthMiddleware);

/**
 * Unified Tap Route
 * Handles Tap-In, Tap-Out, and 5-second Cancellation.
 * Automatically looks up fares from the database and deducts passenger balance.
 */
router.post('/tap', async (req, res) => {
    const { encryptedPassengerId, stop, timestamp, busId, latitude, longitude } = req.body;

    try {
        // 1. Decrypt the passenger ID from the card
        const passengerId = decrypt(encryptedPassengerId);
        if (!passengerId) {
            return res.status(400).json({ success: false, message: 'Invalid NFC Card' });
        }

        // 2. Validate Passenger registration and check balance
        const passenger = await User.findOne({ nfcUid: passengerId });
        if (!passenger) {
            return res.status(404).json({ success: false, message: 'Passenger not registered' });
        }

        let activeTrip = await BusTrip.findOne({ passengerId, isActive: true });

        if (!activeTrip) {
            // --- PHASE: TAP IN ---
            // Minimum balance check (must have at least the minimum fare to start)
            if (passenger.balance < 18) {
                return res.status(403).json({ success: false, message: 'Insufficient balance. Please recharge.' });
            }

            const newTrip = new BusTrip({
                passengerId,
                tapInStop: stop,
                tapInTime: new Date(timestamp),
                tapInLatitude: latitude,
                tapInLongitude: longitude,
                busId
            });
            await newTrip.save();

            const tapLog = new BusTap({
                passengerId,
                stop,
                type: 'TAP_IN',
                timestamp: new Date(timestamp),
                busId,
                latitude,
                longitude
            });
            await tapLog.save();

            // Update user status
            passenger.isTappedIn = true;
            await passenger.save();

            console.log(`Tap In: ${passenger.name} at ${stop}`);
            return res.status(200).json({
                success: true,
                type: 'TAP_IN',
                message: `Welcome, ${passenger.name}! Tap In at ${stop}`,
                passengerId
            });

        } else {
            const tapOutTime = new Date(timestamp);

            // --- PHASE: CANCELLATION (within 5 seconds) ---
            const timeDiffSeconds = (tapOutTime - activeTrip.tapInTime) / 1000;
            if (timeDiffSeconds <= 5 && activeTrip.tapInStop === stop) {
                await BusTrip.deleteOne({ _id: activeTrip._id });
                await BusTap.findOneAndDelete({ passengerId, type: 'TAP_IN', busId }).sort({ timestamp: -1 });

                passenger.isTappedIn = false;
                await passenger.save();

                console.log(`Tap Cancelled: ${passenger.name}`);
                return res.status(200).json({
                    success: true,
                    type: 'CANCELLED',
                    message: 'Ride Cancelled. No fare charged.',
                    passengerId
                });
            }

            // --- PHASE: TAP OUT ---
            // 3. Lookup precise fare from the database Fare Matrix
            const fareRecord = await Fare.findOne({
                sourceStop: activeTrip.tapInStop,
                destinationStop: stop
            });

            // Fallback to minimum fare if specific record not found
            const calculatedFare = fareRecord ? fareRecord.fare : 18;

            if (passenger.balance < calculatedFare) {
                // In a real system, you might allow a single negative balance trip,
                // but here we enforce strict payment.
                return res.status(403).json({ success: false, message: 'Insufficient balance to complete trip.' });
            }

            // 4. Deduct Balance and finalize trip
            passenger.balance -= calculatedFare;
            passenger.isTappedIn = false;
            await passenger.save();

            activeTrip.isActive = false;
            activeTrip.tapOutStop = stop;
            activeTrip.tapOutTime = tapOutTime;
            activeTrip.tapOutLatitude = latitude;
            activeTrip.tapOutLongitude = longitude;
            await activeTrip.save();

            const tapLog = new BusTap({
                passengerId,
                stop,
                type: 'TAP_OUT',
                timestamp: tapOutTime,
                busId,
                fare: calculatedFare,
                latitude,
                longitude
            });
            await tapLog.save();

            console.log(`Tap Out: ${passenger.name}. Fare: Rs. ${calculatedFare}`);
            return res.status(200).json({
                success: true,
                type: 'TAP_OUT',
                passengerId,
                origin: activeTrip.tapInStop,
                destination: stop,
                fare: calculatedFare,
                remainingBalance: passenger.balance,
                duration: Math.round((tapOutTime - activeTrip.tapInTime) / 60000)
            });
        }
    } catch (error) {
        console.error('❌ Tap Processing Error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error during tap processing' });
    }
});

// Fetch History Logs
router.get('/history', async (req, res) => {
    try {
        const taps = await BusTap.find().sort({ timestamp: -1 }).limit(50);
        res.status(200).json(taps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
