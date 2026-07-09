const mongoose = require('mongoose');

/**
 * Bus Trip Model
 * Tracks active trips (Tap-In without Tap-Out yet).
 */
const BusTripSchema = new mongoose.Schema({
  passengerId: { type: String, required: true },
  tapInStop: String,
  tapInTime: Date,
  tapInLatitude: Number,
  tapInLongitude: Number,
  tapOutStop: String,
  tapOutTime: Date,
  tapOutLatitude: Number,
  tapOutLongitude: Number,
  busId: String,
  isActive: { type: Boolean, default: true }
}, { collection: 'bustrips' }); // Isolated bus-only collection

module.exports = mongoose.model('BusTrip', BusTripSchema);
