const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

// GET current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET by username
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-password');
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE profile
router.put('/update', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const {
      firstName, lastName, username, email, phone, address, dob
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Uniqueness checks if values changed
    if (username && username.toLowerCase().trim() !== user.username) {
      const exists = await User.findOne({ username: username.toLowerCase().trim(), _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ error: 'Username already taken' });
      user.username = username.toLowerCase().trim();
    }
    if (email && email.toLowerCase().trim() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ error: 'Email already in use' });
      user.email = email.toLowerCase().trim();
      user.emailVerified = false; // needs re-verify
    }
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ error: 'Phone already in use' });
      user.phone = phone;
      user.phoneVerified = false;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName  !== undefined) user.lastName  = lastName;
    if (address   !== undefined) user.address   = address;

    if (dob !== undefined && dob !== '') {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid DOB format (use YYYY-MM-DD)' });
      user.dob = d;
      user.recalcAge();
    }

    // profile pic
    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
