// src/routes/ai.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// POST /api/ai/suggest
router.post("/suggest", auth, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: "Goal is required" });

    // Mock AI logic (heuristic based on keywords)
    let tasks = [];
    const lowerGoal = goal.toLowerCase();

    if (lowerGoal.includes("react") || lowerGoal.includes("code") || lowerGoal.includes("learn")) {
      tasks = [
        "Setup development environment (Node.js, VS Code)",
        "Watch introductory tutorial/read documentation",
        "Build a 'Hello World' application",
        "Learn about Components and Props",
        "Understand State and Hooks (useState, useEffect)",
        "Build a small project (To-Do List)"
      ];
    } else if (lowerGoal.includes("party") || lowerGoal.includes("event")) {
      tasks = [
        "Create a guest list",
        "Choose a date and venue",
        "Send out invitations",
        "Plan the menu and drinks",
        "Create a music playlist",
        "Buy decorations"
      ];
    } else if (lowerGoal.includes("fitness") || lowerGoal.includes("workout") || lowerGoal.includes("health")) {
      tasks = [
        "Create a workout schedule",
        "Buy healthy groceries",
        "Go for a 30-minute run",
        "Do a full-body workout",
        "Drink 3 liters of water",
        "Sleep for 8 hours"
      ];
    } else {
      // Generic breakdown
      tasks = [
        `Research about ${goal}`,
        `Create a plan for ${goal}`,
        `Execute step 1 of ${goal}`,
        `Review progress on ${goal}`,
        `Finalize ${goal}`
      ];
    }

    // Simulate network delay
    setTimeout(() => {
      res.json({ tasks });
    }, 1000);

  } catch (err) {
    console.error("AI suggest error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/ai/solve
router.post("/solve", auth, async (req, res) => {
  try {
    const { problem } = req.body;
    if (!problem) return res.status(400).json({ error: "Problem description is required" });

    const lowerProblem = problem.toLowerCase();

    // Mock AI Answer
    let answer = `Here is a suggested solution for "${problem}":\n\n1. Analyze the root cause of the issue.\n2. Break down the problem into smaller, manageable parts.\n3. Research similar cases or documentation.\n4. Implement a step-by-step fix.\n5. Test the solution thoroughly.`;

    if (lowerProblem.includes("bug") || lowerProblem.includes("error")) {
      answer = `It seems you're dealing with a bug. Here's how to approach it:\n\n1. Read the error message carefully.\n2. Check the logs for stack traces.\n3. Isolate the code causing the issue.\n4. Search for the error message online.\n5. Apply a fix and regression test.`;
    } else if (lowerProblem.includes("decision") || lowerProblem.includes("choose")) {
      answer = `Making a decision can be tough. Try this:\n\n1. List the pros and cons of each option.\n2. Evaluate the long-term impact.\n3. Consult with a mentor or peer.\n4. Trust your gut feeling if data is inconclusive.`;
    }

    // YouTube Integration
    let videos = [];
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (YOUTUBE_API_KEY) {
      try {
        const axios = require('axios');
        const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: problem + " tutorial guide",
            key: YOUTUBE_API_KEY,
            maxResults: 3,
            type: 'video'
          }
        });

        videos = ytRes.data.items.map(item => ({
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          link: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));
      } catch (ytErr) {
        console.error("YouTube API Error:", ytErr.message);
        // Fallback to mock if API fails
      }
    }

    if (videos.length === 0) {
      // Mock YouTube Results Fallback
      videos = [
        { title: `How to solve ${problem} - Expert Guide`, channel: "Tech Solutions", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        { title: "Top 5 Tips for Problem Solving", channel: "Productivity Master", thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg", link: "https://www.youtube.com/watch?v=5qap5aO4i9A" },
        { title: "Understanding the Basics", channel: "Learn Daily", thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg", link: "https://www.youtube.com/watch?v=jNQXAC9IVRw" }
      ];
    }

    setTimeout(() => {
      res.json({ answer, videos });
    }, 1500);

  } catch (err) {
    console.error("AI solve error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
