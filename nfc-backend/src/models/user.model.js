const mongoose = require('mongoose');

/**
 * Passenger User Model
 * Stores general transit passengers with their wallet balance and unique IDs.
 */
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    isTappedIn: {
        type: Boolean,
        default: false
    },
    tapInStop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
        default: null
    },
    currentRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        default: null
    },
    nfcUid: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'driver', 'passenger'],
        default: 'passenger'
    }
}, {
    timestamps: true,
    collection: 'users' // Explicitly use 'users' collection
});

module.exports = mongoose.model('User', userSchema);
