// routes/contact.js
const express = require("express");
const router = express.Router();
const { sendMail } = require("../utils/mailer");
const auth = require("../middleware/auth");  // ✅ your JWT auth middleware
const User = require("../models/User");      // ✅ your MongoDB User model

// Only message is needed, user is signed in
router.post("/", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Get user details from MongoDB using req.user.id
    const user = await User.findById(req.user.id).select("username email");
    if (!user) return res.status(404).json({ error: "User not found" });

    await sendMail({
      to: "t.madhansingh23@gmail.com",
      subject: `New Contact Message from ${user.username}`,
      html: `
        <p><b>Name:</b> ${user.username}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Contact mail error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
