const mongoose = require('mongoose');

/**
 * SeedStop Model
 * Points to the 'seed-stops' collection which contains the complete
 * route data and fare matrix in a single document per route.
 */
const seedStopSchema = new mongoose.Schema({
    routeName: {
        type: String,
        required: true
    },
    stops: [String],
    fares: [{
        from: String,
        to: String,
        price: Number
    }]
}, {
    timestamps: true,
    collection: 'seed-stops' // Explicitly use the collection from your screenshot
});

module.exports = mongoose.model('SeedStop', seedStopSchema);
