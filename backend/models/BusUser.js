const mongoose = require('mongoose');

/**
 * Bus User Model
 * Stores bus-specific conductor/driver accounts.
 */
const busUserSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vehicleId: String,
  depotLocation: String
}, { collection: 'bususers' }); // Isolated bus-only collection

module.exports = mongoose.model('BusUser', busUserSchema);
