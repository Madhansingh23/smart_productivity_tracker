const express = require("express");
const router = express.Router();
const { sendMail } = require("../utils/mailer");

router.post("/", async (req, res) => {
  try {
    const { message, name, email } = req.body;
    const user = req.user || {}; // fallback if not logged in

    if (!message) return res.status(400).json({ error: "Message required" });

    const senderName = user.firstName || user.username || name || "Anonymous";
    const senderEmail = user.email || email || "unknown";

    await sendMail({
      to: "t.madhansingh23@gmail.com",
      subject: `New Contact Message from ${senderName}`,
      html: `
        <p><b>Name:</b> ${senderName}</p>
        <p><b>Email:</b> ${senderEmail}</p>
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
