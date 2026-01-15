const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  team1: { type: String, required: true }, // Team Name
  team2: { type: String, required: true }, // Team Name
  date: { type: Date },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  status: { type: String, default: 'scheduled', enum: ['scheduled', 'played'] },
  result: {
    team1Score: { type: Number, min: 0 },
    team2Score: { type: Number, min: 0 }
  }
});

module.exports = mongoose.model('Match', matchSchema);
