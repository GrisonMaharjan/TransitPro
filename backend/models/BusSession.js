const mongoose = require('mongoose');

/**
 * Bus Session Model
 * Tracks active logins for bus accounts to enforce single-device policy.
 */
const BusSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusUser',
        required: true
    },
    busNumber: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
        index: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    logoutTime: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { collection: 'bussessions' }); // Isolated bus-only collection

module.exports = mongoose.model('BusSession', BusSessionSchema);
