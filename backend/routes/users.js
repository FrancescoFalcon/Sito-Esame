const router = require('express').Router();
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

router.get('/me/bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('field');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            query = {
                $or: [
                    { username: { $regex: q, $options: 'i' } },
                    { name: { $regex: q, $options: 'i' } },
                    { surname: { $regex: q, $options: 'i' } }
                ]
            };
        }
        const users = await User.find(query).select('-password');
        
        const usersWithTournaments = await Promise.all(users.map(async (user) => {
            const tournaments = await Tournament.find({ creator: user._id });
            return { ...user.toObject(), tournaments };
        }));

        res.json(usersWithTournaments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        const tournaments = await Tournament.find({ creator: req.params.id });
        res.json({ ...user.toObject(), tournaments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
