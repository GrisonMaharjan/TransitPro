const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    collection: 'routelocation' // Point to the collection shown in your screenshot
});

module.exports = mongoose.model('Stop', stopSchema);
