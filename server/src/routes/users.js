// src/routes/users.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// Get current user info (safe: no password)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Fetch /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
