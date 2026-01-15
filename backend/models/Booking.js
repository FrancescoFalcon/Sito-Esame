const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  slot: { type: String, required: true } // "09:00"
});

module.exports = mongoose.model('Booking', bookingSchema);
