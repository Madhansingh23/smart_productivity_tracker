// src/routes/users.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// helper to format profilePic
const formatUser = (u) => {
  const obj = u.toObject ? u.toObject() : u;
  if (obj.profilePic?.data) {
    obj.profilePic = `data:${obj.profilePic.contentType};base64,${obj.profilePic.data.toString("base64")}`;
  } else {
    obj.profilePic = null;
  }
  delete obj.password;
  return obj;
};

// Get current user info
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(formatUser(user));
  } catch (err) {
    console.error("Fetch /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload / update profile picture
router.post("/me/profile-pic", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.profilePic)
      return res.status(400).json({ error: "No file uploaded" });

    const file = req.files.profilePic; // from express-fileupload or multer
    const user = await User.findById(req.user._id);

    user.profilePic = {
      data: file.data,
      contentType: file.mimetype,
    };

    await user.save();
    res.json(formatUser(user));
  } catch (err) {
    console.error("Profile pic upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
