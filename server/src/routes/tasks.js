// src/routes/tasks.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload"); // Import upload middleware
const Task = require("../models/Task");
const User = require("../models/User");
const History = require("../models/History");

const STEPS = ["created", "in-progress", "checking", "completed"];

// Helper to format task for response (convert buffer to base64)
const formatTask = (task) => {
  const t = task.toObject ? task.toObject() : task;
  if (t.proof && t.proof.data) {
    t.proof = `data:${t.proof.contentType};base64,${t.proof.data.toString('base64')}`;
  }
  return t;
};

// CREATE task (+1 point)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, dueAt, remindAt, notifyAt } = req.body;

    const task = new Task({
      userId: req.user._id,
      title,
      description,
      dueAt: dueAt ? new Date(dueAt) : null,
      remindAt: remindAt ? new Date(remindAt) : null,
      notifyAt: notifyAt ? new Date(notifyAt) : null,
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

// GET tasks (active only)
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      isArchived: false
    }).sort({ createdAt: -1 });
    res.json(tasks.map(formatTask));
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
      { status: "created", updatedAt: new Date(), completedAt: null, isArchived: false },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: -3 } });
    res.json(formatTask(task));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// UPDATE (supports file upload for proof)
router.put("/:id", auth, upload.single('proof'), async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date() };
    if (data.dueAt) data.dueAt = new Date(data.dueAt);
    if (data.remindAt) data.remindAt = new Date(data.remindAt);
    if (data.notifyAt) data.notifyAt = new Date(data.notifyAt);
    if (data.status && !STEPS.includes(data.status)) delete data.status;

    // Handle file upload
    if (req.file) {
      data.proof = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      // Bonus points for proof?
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 2 } });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Calculate points if status changes
    if (data.status && data.status !== task.status) {
      let pointsChange = 0;

      // Completion reward
      if (data.status === "completed" && task.status !== "completed") {
        pointsChange += 4;
        data.completedAt = new Date();
      }
      // Un-completion penalty
      else if (task.status === "completed" && data.status !== "completed") {
        pointsChange -= 4;
        data.completedAt = null;
      }
      // Progression reward (small)
      else if (STEPS.indexOf(data.status) > STEPS.indexOf(task.status)) {
        pointsChange += 1;
      }

      if (pointsChange !== 0) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: pointsChange } });
        data.pointsAwarded = (task.pointsAwarded || 0) + pointsChange;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    res.json(formatTask(updatedTask));
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

// HISTORY fetch (archived tasks)
router.get("/history", auth, async (req, res) => {
  try {
    const history = await Task.find({
      userId: req.user._id,
      isArchived: true
    }).sort({ updatedAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// ARCHIVE task
router.post("/:id/archive", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isArchived: true, updatedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Optional: reward archiving with +1 point
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 1 } });

    res.json({ ok: true, task: formatTask(task) });
  } catch (err) {
    console.error("Archive error:", err);
    res.status(500).json({ error: "Failed to archive task" });
  }
});

// UNARCHIVE task
router.post("/:id/unarchive", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isArchived: false, updatedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ ok: true, task: formatTask(task) });
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

    res.json({ task: formatTask(task), user }); // return both
  } catch (err) {
    console.error("Advance error:", err);
    res.status(500).json({ error: "server error" });
  }
});


module.exports = router;
