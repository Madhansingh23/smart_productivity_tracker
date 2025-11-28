// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },

  username: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
  usernameChanged: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true },

  password: { type: String, required: true },

  // instead of file path
  profilePic: {
    data: Buffer,
    contentType: String
  },

  dob: { type: Date },
  age: { type: Number },
  address: { type: String, default: '' },

  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },

  points: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  settings: {
    theme: { type: String, default: "light" },
    timezone: { type: String, default: 'UTC' },
    minDailyTasks: { type: Number, default: 1 },
    notificationsEnabled: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.recalcAge = function () {
  if (!this.dob) { this.age = undefined; return; }
  const today = new Date();
  let age = today.getFullYear() - this.dob.getFullYear();
  const m = today.getMonth() - this.dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.dob.getDate())) age--;
  this.age = age;
};

module.exports = mongoose.model('User', userSchema);
