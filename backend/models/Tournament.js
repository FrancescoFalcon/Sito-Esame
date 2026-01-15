const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  number: { type: Number }
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  players: [playerSchema]
});

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true, enum: ['football', 'volleyball', 'basketball'] },
  maxTeams: { type: Number, required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teams: [teamSchema],
  status: { type: String, default: 'open', enum: ['open', 'active', 'completed'] }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
