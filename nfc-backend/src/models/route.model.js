const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    stops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop'
    }]

}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);