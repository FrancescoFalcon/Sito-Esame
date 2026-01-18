const router = require('express').Router();
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const auth = require('../middleware/auth');

router.get('/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        res.json(match);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/result', auth, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });
        
        const tournament = await Tournament.findById(match.tournament);
        if (tournament.creator.toString() !== req.user._id) return res.status(403).json({ message: 'Unauthorized' });

        const { team1Score, team2Score } = req.body;
        
        if (team1Score === undefined || team2Score === undefined || 
            team1Score === null || team2Score === null ||
            isNaN(team1Score) || isNaN(team2Score) || 
            team1Score < 0 || team2Score < 0) {
            return res.status(400).json({ message: 'Both scores are required and must be valid non-negative numbers' });
        }

        match.result = { team1Score, team2Score };
        match.status = 'played';
        await match.save();
        res.json(match);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
