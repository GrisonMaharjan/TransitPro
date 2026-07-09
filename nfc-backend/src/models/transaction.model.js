const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    type: {
        type: String,
        enum: ['tap-in', 'tap-out'],
        required: true
    },

    sourceStop: {
        type: String,
        default: null
    },

    destinationStop: {
        type: String,
        default: null
    },

    fare: {
        type: Number,
        default: 0
    },

    busNumber: {
        type: String,
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);