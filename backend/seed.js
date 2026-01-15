require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Field = require('./models/Field');
const Tournament = require('./models/Tournament');
const Match = require('./models/Match');

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing in .env');
        process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Pulisci DB
    await User.deleteMany({});
    await Field.deleteMany({});
    await Tournament.deleteMany({});
    await Match.deleteMany({});

    // Crea Utenti
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.create({
      username: 'mario.rossi',
      password: hashedPassword,
      name: 'Mario',
      surname: 'Rossi'
    });

    // Crea Campi
    await Field.create([
      { name: 'San Siro', sport: 'football', address: 'Via Piccolomini 5' },
      { name: 'PalaLido', sport: 'basketball', address: 'Piazza Stuparich 1' },
      { name: 'Beach Arena', sport: 'volleyball', address: 'Idroscalo Milano' }
    ]);

    // Crea Torneo con Squadre e Giocatori
    await Tournament.create({
      name: 'Champions League 2026',
      sport: 'football',
      maxTeams: 4,
      startDate: new Date().toISOString().split('T')[0],
      creator: user._id,
      teams: [
        { name: 'Real Madrid', players: [{ name: 'Vinicius', surname: 'Jr', number: 7 }] },
        { name: 'Milan', players: [{ name: 'Rafael', surname: 'Leao', number: 10 }] }
      ]
    });

    console.log('Database Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
