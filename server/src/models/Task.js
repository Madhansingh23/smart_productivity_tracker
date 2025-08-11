
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: String,
  description: String,
  tags: [String],
  priority: { type: String, enum:['low','med','high'], default:'med' },
  dueAt: Date,
  remindAt: Date,
  estimatedMinutes: Number,
  actualMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ['todo','in-progress','done'], default: 'todo' },
  pointsAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
taskSchema.index({ userId: 1, status: 1, dueAt: 1 });
module.exports = mongoose.model('Task', taskSchema);
