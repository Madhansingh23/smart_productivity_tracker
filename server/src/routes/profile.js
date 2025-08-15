const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

// ✅ First: GET current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ✅ Then: GET profile by username
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ✅ Upload profile pic
router.post('/upload-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ ok: true, profilePic: user.profilePic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload failed' });
  }
});

module.exports = router;
