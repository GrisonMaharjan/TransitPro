const express = require('express');
const router = express.Router();
const BusTap = require('../models/BusTap');
const BusTrip = require('../models/BusTrip');
const { calculateFare, getDistance } = require('../utils/busUtils');
const busAuthMiddleware = require('../middleware/busAuth');

// Protect all tap routes with Bus authentication
router.use(busAuthMiddleware);

// Unified Tap Route (Handles In, Out, and Cancellation)
router.post('/tap', async (req, res) => {
    const { passengerId, stop, timestamp, busId, latitude, longitude } = req.body;

    try {
        let activeTrip = await BusTrip.findOne({ passengerId, isActive: true });

        if (!activeTrip) {
            // PHASE: TAP IN
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

            return res.status(200).json({
                success: true,
                type: 'TAP_IN',
                message: `Tap In Successful at ${stop}`,
                passengerId
            });

        } else {
            const tapOutTime = new Date(timestamp);

            // 1. Check for 5-second cancellation
            const timeDiffSeconds = (tapOutTime - activeTrip.tapInTime) / 1000;
            if (timeDiffSeconds <= 5) {
                await BusTrip.deleteOne({ _id: activeTrip._id });
                await BusTap.findOneAndDelete({ passengerId, type: 'TAP_IN', busId }).sort({ timestamp: -1 });

                return res.status(200).json({
                    success: true,
                    type: 'CANCELLED',
                    message: 'Ride Cancelled',
                    passengerId
                });
            }

            // 2. NORMAL TAP OUT PHASE
            const fare = calculateFare(getDistance(activeTrip.tapInStop, stop));
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
                fare,
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
                fare,
                duration: Math.round((tapOutTime - activeTrip.tapInTime) / 60000)
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
