// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

const STEPS = ['created', 'in-progress', 'checking', 'completed'];

// +1 on create
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ userId: req.user._id, ...req.body, status: 'created' });
    await task.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 1 } }); // create +1
    res.json(task);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/', auth, async (req, res) => {
  try { 
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

// advance one phase: +1 (except final completion which is +4 below)
router.post('/:id/advance', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const idx = STEPS.indexOf(task.status);
    if (idx === -1 || idx === STEPS.length - 1) return res.json(task);

    const next = STEPS[idx + 1];
    task.status = next;
    task.updatedAt = new Date();

    let inc = 1; // advance +1
    if (next === 'completed') inc = 4; // completion +4

    task.pointsAwarded = (task.pointsAwarded || 0) + inc;
    await task.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: inc } });

    res.json(task);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

// redo from beginning: set to 'created' and -3
router.post('/:id/redo', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'created', updatedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: -3 } });
    res.json(task);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

// update misc fields (title, description, dueAt, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date() };
    // do not let callers skip points; they should use /advance or /redo
    if (data.status && !STEPS.includes(data.status)) delete data.status;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, data, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

// delete: -1
router.delete('/:id', auth, async (req, res) => {
  try { 
    const del = await Task.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (del.deletedCount > 0) await User.findByIdAndUpdate(req.user._id, { $inc: { points: -1 } });
    res.json({ ok: true });
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;
