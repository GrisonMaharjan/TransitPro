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
 * Implements Reward Points and Credit (Ride Now, Pay Later) features.
 */
router.post('/tap', async (req, res) => {
    const { encryptedPassengerId, stop, timestamp, busId, latitude, longitude } = req.body;

    try {
        const passengerId = decrypt(encryptedPassengerId);
        if (!passengerId) {
            return res.status(400).json({ success: false, message: 'Invalid NFC Card' });
        }

        const passenger = await User.findOne({ nfcUid: passengerId });
        if (!passenger) {
            return res.status(404).json({ success: false, message: 'Passenger not registered' });
        }

        if (passenger.isNfcBlocked) {
            return res.status(403).json({ success: false, message: 'This NFC Card is blocked.' });
        }

        let activeTrip = await BusTrip.findOne({ passengerId, isActive: true });

        if (!activeTrip) {
            // --- PHASE: TAP IN ---

            // 🛑 BLOCK IF IN DEBT: Must clear negative balance before starting a new trip
            if (passenger.balance < 0) {
                return res.status(403).json({
                    success: false,
                    message: `Entry Denied. Please clear your previous credit of Rs. ${Math.abs(passenger.balance)}.`
                });
            }

            // 💳 CREDIT ELIGIBILITY CHECK:
            // Standard entry requires Rs. 18.
            // If balance is between 0 and 17, they can only enter if they have 5+ Reward Points.
            const isEligibleForEmergencyCredit = passenger.rewardPoints >= 5;

            if (passenger.balance < 18 && !isEligibleForEmergencyCredit) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient balance (Min Rs. 18). Need 5+ Reward Points to use emergency credit.'
                });
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

            passenger.isTappedIn = true;
            await passenger.save();

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

                return res.status(200).json({
                    success: true,
                    type: 'CANCELLED',
                    message: 'Ride Cancelled. No fare charged.',
                    passengerId
                });
            }

            // --- PHASE: TAP OUT ---
            const fareRecord = await Fare.findOne({
                sourceStop: activeTrip.tapInStop,
                destinationStop: stop
            });

            const calculatedFare = fareRecord ? fareRecord.fare : 18;

            // 🛑 CREDIT LIMIT CHECK: Max debt allowed is 100
            const potentialBalance = passenger.balance - calculatedFare;
            if (potentialBalance < -100) {
                return res.status(403).json({
                    success: false,
                    message: `Trip exceeds credit limit of Rs. 100. Current Balance: Rs. ${passenger.balance}`
                });
            }

            // 💰 REWARD POINTS LOGIC:
            // fare > 30 : 2 points
            // fare > 20 : 1 point
            // fare < 20 : 0 points
            let pointsEarned = 0;
            if (calculatedFare > 30) pointsEarned = 2;
            else if (calculatedFare > 20) pointsEarned = 1;

            // Update user status and deduct balance
            passenger.balance -= calculatedFare;
            passenger.rewardPoints += pointsEarned;
            passenger.isTappedIn = false;

            // Mark as having unpaid credit if balance goes negative
            if (passenger.balance < 0) {
                passenger.hasUnpaidCredit = true;
            }

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

            return res.status(200).json({
                success: true,
                type: 'TAP_OUT',
                passengerId,
                origin: activeTrip.tapInStop,
                destination: stop,
                fare: calculatedFare,
                remainingBalance: passenger.balance,
                rewardPoints: passenger.rewardPoints,
                pointsEarned,
                isCreditTrip: passenger.balance < 0
            });
        }
    } catch (error) {
        console.error('❌ Tap Error:', error.message);
        res.status(500).json({ success: false, error: 'Server error during tap' });
    }
});

/**
 * Fetch History Logs
 * Filtered by the logged-in Bus Number and only for TODAY.
 */
router.get('/history', async (req, res) => {
    try {
        const busNumber = req.user.busNumber;

        // Set date range for TODAY
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const taps = await BusTap.find({
            busId: busNumber,
            timestamp: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        }).sort({ timestamp: -1 });

        res.status(200).json(taps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
