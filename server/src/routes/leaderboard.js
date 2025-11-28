// src/routes/leaderboard.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/leaderboard - Top 10 users
router.get("/", auth, async (req, res) => {
    try {
        const users = await User.find()
            .sort({ points: -1 })
            .limit(10)
            .select("username firstName lastName points profilePic badges");

        // Add rank
        const ranked = users.map((u, i) => ({
            ...u.toObject(),
            rank: i + 1
        }));

        res.json(ranked);
    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
