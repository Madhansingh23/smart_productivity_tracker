const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: './uploads/profile-pics',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Get profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile pic
router.post('/upload-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const filePath = `/uploads/profile-pics/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profilePic: filePath });
    res.json({ success: true, profilePic: filePath });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
