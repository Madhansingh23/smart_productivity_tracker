const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' }, // store image path or URL
  age: { type: Number },
  dob: { type: Date },
  selfDescription: { type: String },
  points: { type: Number, default: 0 },
  settings: {
    timezone: { type: String, default: 'UTC' },
    minDailyTasks: { type: Number, default: 1 },
    notificationsEnabled: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
