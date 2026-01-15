const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true, enum: ['football', 'volleyball', 'basketball'] },
  address: { type: String, required: true },
  bookableSlots: [{ type: String }] 
});

module.exports = mongoose.model('Field', fieldSchema);
