const mongoose = require('mongoose');

/**
 * Bus Tap Model
 * Logs individual NFC card tap events.
 */
const BusTapSchema = new mongoose.Schema({
  passengerId: { type: String, required: true },
  stop: { type: String, required: true },
  type: { type: String, enum: ['TAP_IN', 'TAP_OUT'], required: true },
  timestamp: { type: Date, default: Date.now },
  busId: String,
  fare: Number,
  latitude: Number,
  longitude: Number
}, { collection: 'bustaps' }); // Isolated bus-only collection

module.exports = mongoose.model('BusTap', BusTapSchema);
