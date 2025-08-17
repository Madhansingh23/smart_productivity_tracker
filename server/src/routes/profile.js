// src/routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

// GET current user (send base64 image if available)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userObj = user.toObject();
    if (user.profilePic?.data) {
      userObj.profilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString("base64")}`;
    } else {
      userObj.profilePic = null;
    }

    res.json(userObj);
  } catch (err) {
    console.error("Profile /me error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE profile
router.put('/update', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, address, dob } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // update text fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName  !== undefined) user.lastName  = lastName;
    if (address   !== undefined) user.address   = address;
    if (dob) {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid DOB format' });
      user.dob = d;
      user.recalcAge();
    }

    if (username && username.toLowerCase().trim() !== user.username) {
      if (user.usernameChanged) {
        return res.status(400).json({ error: 'Username can only be changed once' });
      }
      const exists = await User.findOne({ username: username.toLowerCase().trim(), _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ error: 'Username already taken' });
      user.username = username.toLowerCase().trim();
      user.usernameChanged = true;
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ error: 'Email already in use' });
      user.email = email.toLowerCase().trim();
      user.emailVerified = false;
    }

    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ error: 'Phone already in use' });
      user.phone = phone;
      user.phoneVerified = false;
    }

    // ✅ save profile pic directly into Mongo
    if (req.file) {
      user.profilePic = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await user.save();

    const userObj = user.toObject();
    if (user.profilePic?.data) {
      userObj.profilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString("base64")}`;
    } else {
      userObj.profilePic = null;
    }

    res.json({ ok: true, user: userObj });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: 'Update failed: ' + err.message });
  }
});

module.exports = router;
