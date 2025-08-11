
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const { scoreOnCompletion } = require('../utils/scoring');

router.post('/', auth, async (req, res) => {
  try { const task = new Task({ userId: req.user._id, ...req.body }); await task.save(); res.json(task); }
  catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/', auth, async (req, res) => {
  try { const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 }); res.json(tasks); }
  catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const data = req.body;
    if(data.status === 'done') {
      const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { ...data, updatedAt: new Date() }, { new: true });
      // scoring on completion
      const points = scoreOnCompletion(task, new Date());
      task.pointsAwarded = points;
      await task.save();
      // update user points
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { $inc: { points } });
      return res.json(task);
    }
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { ...data, updatedAt: new Date() }, { new: true });
    res.json(task);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await Task.deleteOne({ _id: req.params.id, userId: req.user._id }); res.json({ ok: true }); }
  catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;
