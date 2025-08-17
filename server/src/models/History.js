const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  title: String,
  description: String,
  dueAt: Date,
  remindAt: Date,
  status: String,
  completedAt: Date,
  archivedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", historySchema);
