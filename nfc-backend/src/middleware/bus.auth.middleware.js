const jwt = require('jsonwebtoken');
const BusSession = require('../models/bus.session.model');

/**
 * Bus Authentication Middleware
 *
 * Verifies the JWT token and checks the database to ensure
 * the session is still active (not logged out) and valid for 1 hour.
 */
const busAuthMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 1. Verify JWT mathematical validity and 1-hour expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Check if this specific token is active in the database
        const session = await BusSession.findOne({ token: token, isActive: true });

        if (!session) {
            console.log(`Access Denied: Session for Bus ${decoded.busNumber} was revoked.`);
            return res.status(401).json({
                message: 'Your session has been logged out from another device. Please login again.'
            });
        }

        req.user = decoded;
        req.token = token;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.log('❌ Auth Failed: Session Expired (1h limit reached)');

            // Auto-deactivate the expired session in database
            await BusSession.findOneAndUpdate({ token: token }, { isActive: false });

            return res.status(401).json({ message: 'Session expired (1h). Please login again to continue your shift.' });
        }

        console.log('❌ Access Denied: Invalid token');
        res.status(401).json({ message: 'Invalid session. Please login again.' });
    }
};

module.exports = { busAuthMiddleware };
