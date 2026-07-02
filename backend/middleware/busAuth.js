const jwt = require('jsonwebtoken');
const BusSession = require('../models/BusSession');

/**
 * Bus Authentication Middleware
 *
 * Verifies the JWT token and checks the database to ensure
 * the session is still active (not logged out).
 */
const busAuthMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 1. Verify JWT mathematical validity and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Check if this specific token is active in the database
        const session = await BusSession.findOne({ token: token, isActive: true });

        if (!session) {
            console.log(`Access Denied: Session for Bus ${decoded.busNumber} is revoked or logged out.`);
            return res.status(401).json({
                message: 'Your session has ended or you have logged in on another device. Please login again.'
            });
        }

        req.user = decoded;
        req.token = token;
        next();
    } catch (err) {
        console.log('Access Denied: Invalid or expired token');
        res.status(401).json({ message: 'Session expired. Please login again.' });
    }
};

module.exports = busAuthMiddleware;
