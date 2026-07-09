const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    order: {
        type: Number,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Stop', stopSchema);