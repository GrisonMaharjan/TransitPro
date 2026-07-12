const mongoose = require('mongoose');

/**
 * Fare Model
 * Stores the specific price between two stops for a particular route.
 */
const fareSchema = new mongoose.Schema({
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    sourceStop: {
        type: String,
        required: true
    },
    destinationStop: {
        type: String,
        required: true
    },
    fare: {
        type: Number,
        required: true
    }
}, { timestamps: true, collection: 'fares' }); // Explicitly pointing to 'fares' collection

fareSchema.index({ routeId: 1, sourceStop: 1, destinationStop: 1 }, { unique: true });

module.exports = mongoose.model('Fare', fareSchema);
