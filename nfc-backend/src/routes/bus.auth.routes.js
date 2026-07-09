const express = require('express');
const router = express.Router();
const BusUser = require('../models/bus.user.model');
const BusSession = require('../models/bus.session.model');
const jwt = require('jsonwebtoken');

/**
 * Bus Login Route
 *
 * Enforces a "Block if Active" policy.
 * Sessions are valid for 1 HOUR.
 */
router.post('/login', async (req, res) => {
    const { busNumber, password } = req.body;

    console.log(`\n--- Login Attempt ---`);
    console.log(`Received Bus Number: [${busNumber}]`);

    try {
        // 1. Authenticate the user
        const user = await BusUser.findOne({ busNumber });

        if (!user) {
            console.log(`❌ Login Failed: Bus Number [${busNumber}] not found.`);
            return res.status(401).json({ message: 'Invalid bus number or password' });
        }

        if (user.password !== password) {
            console.log('❌ Login Failed: Password mismatch');
            return res.status(401).json({ message: 'Invalid bus number or password' });
        }

        // 2. SINGLE DEVICE ENFORCEMENT (Block strategy)
        // Note: We only block if the session is active AND within its 1-hour window.
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const activeSession = await BusSession.findOne({
            busNumber: busNumber,
            isActive: true,
            loginTime: { $gte: oneHourAgo }
        });

        if (activeSession) {
            console.log(`Login Blocked: Bus ${busNumber} is already active on another device.`);
            return res.status(409).json({
                message: 'This account is already active elsewhere. Please logout or wait for the session to expire (1h).'
            });
        }

        // 3. Create a unique JWT valid for 1 HOUR
        const token = jwt.sign(
            {
                userId: user._id,
                busNumber: user.busNumber,
                vehicleId: user.vehicleId,
                sessionStarted: new Date().getTime()
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Session valid for 1 hour
        );

        // 4. Save the new session
        const newSession = new BusSession({
            userId: user._id,
            busNumber: user.busNumber,
            token: token,
            isActive: true
        });
        await newSession.save();

        console.log(`✅ Login Successful: 1-hour session started for Bus ${busNumber}`);

        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                busNumber: user.busNumber,
                vehicleId: user.vehicleId,
                depotLocation: user.depotLocation
            }
        });
    } catch (error) {
        console.error('❌ Login System Error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Bus Logout Route
 */
const { busAuthMiddleware } = require('../middleware/bus.auth.middleware');
router.post('/logout', busAuthMiddleware, async (req, res) => {
    const token = req.token;

    try {
        await BusSession.findOneAndUpdate(
            { token: token },
            { isActive: false, logoutTime: new Date() }
        );
        console.log(`Session explicitly logged out.`);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Logout error' });
    }
});

module.exports = router;
