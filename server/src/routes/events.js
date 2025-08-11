
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');

router.post('/', auth, async (req, res) => {
  try { const { type,start,end,meta } = req.body; const event = new Event({ userId: req.user._id, type, start, end, meta }); await event.save(); res.json(event); }
  catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/', auth, async (req, res) => {
  try { const events = await Event.find({ userId: req.user._id }).sort({ start: -1 }).limit(1000); res.json(events); }
  catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;
