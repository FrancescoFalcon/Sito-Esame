const router = require('express').Router();
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// List tournaments
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            query = {
                name: { $regex: q, $options: 'i' }
            };
        }
        const tournaments = await Tournament.find(query).populate('creator', 'username');
        res.json(tournaments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create tournament
router.post('/', auth, async (req, res) => {
    try {
        const { name, sport, maxTeams, startDate } = req.body;

        if (!name || name.length < 3) return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        if (!maxTeams || maxTeams < 2) return res.status(400).json({ message: 'Max teams must be at least 2' });
        
        const dateObj = new Date(startDate);
        const now = new Date();
        const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        if (isNaN(dateObj.getTime()) || dateObj < todayMidnight) {
            return res.status(400).json({ message: 'Invalid start date. Cannot be in the past.' });
        }

        const tournament = new Tournament({
            name,
            sport,
            maxTeams,
            startDate,
            creator: req.user._id
        });
        await tournament.save();
        res.status(201).json(tournament);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get tournament details
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('creator', 'username');
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        
        const matches = await Match.find({ tournament: req.params.id });
        res.json({ ...tournament.toObject(), matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit tournament
router.put('/:id', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.creator.toString() !== req.user._id) return res.status(403).json({ message: 'Unauthorized' });

        const { name, maxTeams, startDate, teams } = req.body;

        if (name !== undefined && name.length < 3) return res.status(400).json({ message: 'Name must be at least 3 characters long' });
        if (maxTeams !== undefined && maxTeams < 2) return res.status(400).json({ message: 'Max teams must be at least 2' });
        if (startDate !== undefined) {
            const dateObj = new Date(startDate);
            const now = new Date();
            const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
            
            if (isNaN(dateObj.getTime()) || dateObj < todayMidnight) {
                return res.status(400).json({ message: 'Invalid start date. Cannot be in the past.' });
            }
        }

        const effectiveTeamsCount = teams ? teams.length : tournament.teams.length;
        const effectiveMaxTeams = maxTeams !== undefined ? maxTeams : tournament.maxTeams;

        if (effectiveTeamsCount > effectiveMaxTeams) {
            return res.status(400).json({ message: 'Number of teams exceeds maximum allowed' });
        }

        if (name) tournament.name = name;
        if (startDate) tournament.startDate = startDate;
        if (maxTeams !== undefined) tournament.maxTeams = maxTeams;
        
        if (teams) {
             tournament.teams = teams;
             tournament.markModified('teams');
        }

        await tournament.save();
        res.json(tournament);
    } catch (err) {
        console.error('Update error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Delete tournament
router.delete('/:id', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.creator.toString() !== req.user._id) return res.status(403).json({ message: 'Unauthorized' });

        await Tournament.deleteOne({ _id: req.params.id });
        await Match.deleteMany({ tournament: req.params.id });
        res.json({ message: 'Tournament deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate matches
router.post('/:id/matches/generate', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.creator.toString() !== req.user._id) return res.status(403).json({ message: 'Unauthorized' });

        const teams = tournament.teams;
        if (teams.length < 2) return res.status(400).json({ message: 'Not enough teams' });

        await Match.deleteMany({ tournament: req.params.id });

        const matches = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matches.push({
                    tournament: tournament._id,
                    team1: teams[i].name,
                    team2: teams[j].name,
                    status: 'scheduled',
                    date: tournament.startDate
                });
            }
        }

        await Match.insertMany(matches);
        tournament.status = 'active';
        await tournament.save();
        
        res.json({ message: 'Matches generated', count: matches.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List matches
router.get('/:id/matches', async (req, res) => {
    try {
        const matches = await Match.find({ tournament: req.params.id });
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Standings
router.get('/:id/standings', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        const matches = await Match.find({ tournament: req.params.id, status: 'played' });
        const standings = {};

        tournament.teams.forEach(team => {
            standings[team.name] = {
                team: team.name,
                points: 0,
                played: 0,
                scored: 0,
                conceded: 0,
                diff: 0
            };
        });

        matches.forEach(match => {
            const t1 = standings[match.team1];
            const t2 = standings[match.team2];
            
            if (t1 && t2) {
                t1.played++;
                t2.played++;
                t1.scored += match.result.team1Score;
                t1.conceded += match.result.team2Score;
                t2.scored += match.result.team2Score;
                t2.conceded += match.result.team1Score;
                
                t1.diff = t1.scored - t1.conceded;
                t2.diff = t2.scored - t2.conceded;

                if (match.result.team1Score > match.result.team2Score) {
                    t1.points += (tournament.sport === 'football' ? 3 : 2);
                } else if (match.result.team2Score > match.result.team1Score) {
                    t2.points += (tournament.sport === 'football' ? 3 : 2);
                } else {
                    if (tournament.sport === 'football') {
                        t1.points += 1;
                        t2.points += 1;
                    }
                }
            }
        });

        const standingsArray = Object.values(standings).sort((a, b) => b.points - a.points || b.diff - a.diff);
        res.json(standingsArray);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
