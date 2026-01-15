const router = require('express').Router();
const Field = require('../models/Field');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Get all fields (searchable)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { sport: { $regex: q, $options: 'i' } },
          { address: { $regex: q, $options: 'i' } }
        ]
      };
    }
    const fields = await Field.find(query);
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get field details
router.get('/:id', async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    res.json(field);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get availability
router.get('/:id/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date required' });
    
    const field = await Field.findById(req.params.id);
    const bookings = await Booking.find({ field: req.params.id, date });
    const bookedSlots = bookings.map(b => b.slot);
    
    // Assuming field.bookableSlots is defined in the model or we generate them
    const allSlots = field.bookableSlots && field.bookableSlots.length > 0 ? field.bookableSlots : ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a slot
router.post('/:id/bookings', auth, async (req, res) => {
  try {
    const { date, slot } = req.body;
    // Check if slot is free
    const existing = await Booking.findOne({ field: req.params.id, date, slot });
    if (existing) return res.status(400).json({ message: 'Slot already booked' });
    
    // Check past date (simple check)
    if (new Date(date + 'T' + slot) < new Date()) {
        return res.status(400).json({ message: 'Cannot book past slots' });
    }

    const booking = new Booking({
      user: req.user._id,
      field: req.params.id,
      date,
      slot
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel booking
router.delete('/:id/bookings/:bookingId', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user._id });
        if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
        
        await Booking.deleteOne({ _id: req.params.bookingId });
        res.json({ message: 'Booking cancelled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
