const mongoose = require('mongoose');

/**
 * Bus User Model
 * Stores bus-specific conductor/driver accounts.
 */
const busUserSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vehicleId: String,
  depotLocation: String,
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  }
}, { collection: 'bususers' }); // Isolated bus-only collection

module.exports = mongoose.model('BusUser', busUserSchema);
