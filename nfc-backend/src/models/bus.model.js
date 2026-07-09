const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({

    busNumber: {
        type: String,
        required: true
    },

    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    }

}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);