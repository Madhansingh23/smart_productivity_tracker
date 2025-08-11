
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, index: true },
  password: String,
  points: { type: Number, default: 0 },
  settings: {
    timezone: { type: String, default: 'UTC' },
    minDailyTasks: { type: Number, default: 1 },
    notificationsEnabled: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);
