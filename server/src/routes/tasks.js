// src/routes/tasks.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const User = require("../models/User");
const History = require("../models/History");

const STEPS = ["created", "in-progress", "checking", "completed"];

// CREATE task (+1 point)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, dueAt, remindAt } = req.body;

    const task = new Task({
      userId: req.user._id,
      title,
      description,
      dueAt: dueAt ? new Date(dueAt) : null,
      remindAt: remindAt ? new Date(remindAt) : null,
      status: "created",
    });

    await task.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 1 } });

    res.json(task);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// GET tasks
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});



// REDO
router.post("/:id/redo", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: "created", updatedAt: new Date(), completedAt: null },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: -3 } });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date() };
    if (data.dueAt) data.dueAt = new Date(data.dueAt);
    if (data.remindAt) data.remindAt = new Date(data.remindAt);
    if (data.status && !STEPS.includes(data.status)) delete data.status;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      data,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// DELETE (-1 point)
router.delete("/:id", auth, async (req, res) => {
  try {
    const del = await Task.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (del.deletedCount > 0)
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: -1 } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// HISTORY fetch
router.get("/history", auth, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id }).sort({
      archivedAt: -1,
    });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// ARCHIVE task → move from Task → History
router.post("/:id/archive", auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Save to history
    const history = new History({
      userId: req.user._id,
      title: task.title,
      description: task.description,
      dueAt: task.dueAt,
      archivedAt: new Date(),
      completedAt: task.completedAt || null,
      status: task.status
    });
    await history.save();

    // Remove from active tasks
    await Task.deleteOne({ _id: task._id, userId: req.user._id });

    // Optional: reward archiving with +1 point
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 1 } });

    res.json({ ok: true, history });
  } catch (err) {
    console.error("Archive error:", err);
    res.status(500).json({ error: "Failed to archive task" });
  }
});

// UNARCHIVE task → move back from History → Task
router.post("/:id/unarchive", auth, async (req, res) => {
  try {
    const history = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!history) return res.status(404).json({ error: "History item not found" });

    // Recreate task with same status
    const task = new Task({
      userId: req.user._id,
      title: history.title,
      description: history.description,
      dueAt: history.dueAt,
      completedAt: history.completedAt,
      status: history.status || "created",
      updatedAt: new Date()
    });
    await task.save();

    // Remove from history
    await History.deleteOne({ _id: history._id });

    res.json({ ok: true, task });
  } catch (err) {
    console.error("Unarchive error:", err);
    res.status(500).json({ error: "Failed to unarchive task" });
  }
});

// ADVANCE one phase
// router.post("/:id/advance", auth, async (req, res) => {
//   try {
//     const task = await Task.findOne({
//       _id: req.params.id,
//       userId: req.user._id,
//     });
//     if (!task) return res.status(404).json({ error: "Task not found" });

//     const idx = STEPS.indexOf(task.status);
//     if (idx === -1 || idx === STEPS.length - 1) return res.json(task);

//     const next = STEPS[idx + 1];
//     task.status = next;
//     task.updatedAt = new Date();

//     let inc = 1;
//     if (next === "completed") inc = 4;

//     task.pointsAwarded = (task.pointsAwarded || 0) + inc;
//     await task.save();
//     await User.findByIdAndUpdate(req.user._id, { $inc: { points: inc } });

//     res.json(task);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "server error" });
//   }
// });
// ✅ Advance one phase (points + checkpoint update)
router.post("/:id/advance", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const idx = STEPS.indexOf(task.status);
    if (idx === -1 || idx === STEPS.length - 1) return res.json({ task });

    const next = STEPS[idx + 1];
    task.status = next;
    task.updatedAt = new Date();

    let inc = 1;
    if (next === "completed") {
      task.completedAt = new Date();
      inc = 4;
    }

    task.pointsAwarded = (task.pointsAwarded || 0) + inc;
    await task.save();

    // ✅ Update user points and return user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { points: inc } },
      { new: true }
    ).select("-password");

    res.json({ task, user }); // return both
  } catch (err) {
    console.error("Advance error:", err);
    res.status(500).json({ error: "server error" });
  }
});

 
module.exports = router;
