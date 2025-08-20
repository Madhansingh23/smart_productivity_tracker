// routes/ai.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Suggestion = require('../models/Suggestion');
const axios = require('axios');
const { generateRules } = require('../utils/suggestionRules');

const openaiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

let openaiClient = null;
async function initOpenAI() {
  if (!openaiKey) return;
  const OpenAI = (await import('openai')).default;
  openaiClient = new OpenAI({ apiKey: openaiKey });
}
initOpenAI();

// --- Fallback helper ---
async function youtubeFallback(notes) {
  let videos = [];
  try {
    if (youtubeKey && notes) {
      const q = encodeURIComponent(notes);
      const r = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&key=${youtubeKey}&maxResults=6`
      );
      videos = r.data.items.map((it) => ({
        title: it.snippet.title,
        url: 'https://www.youtube.com/watch?v=' + (it.id.videoId || it.id.channelId),
      }));
    }
  } catch (err) {
    console.warn('YouTube fallback search failed:', err.message);
  }

  return {
    suggestions: [
      {
        suggestionType: 'system',
        text:
          '⚠️ Our AI agent is currently under maintenance. You can call him for an interview: t.madhansingh23@gmail.com',
        score: 1,
      },
      {
        suggestionType: 'tip',
        text: 'Meanwhile, here are some YouTube resources you can explore 👇',
        score: 0.8,
      },
    ],
    videos,
    songs: [],
  };
}

// --- Main AI Suggest ---
router.post('/suggest', async (req, res) => {
  try {
    const stats = req.body.stats || {};
    const notes = req.body.notes || '';

    // Try to attach user if token exists (optional auth)
    let user = null;
    try {
      await auth(req, res, () => {});
      user = req.user;
    } catch {
      user = null; // no token / invalid token → guest user
    }

    // Try OpenAI if available
    if (openaiClient) {
      const prompt = `Act as a warm, human productivity coach (English + Tamil if user prefers). 
Given stats: ${JSON.stringify(stats)} and user notes: ${notes}, provide clear, empathetic advice. 
- Suggestions: Up to 5, each with type + text + score. 
- Recommend up to 3 YouTube video ideas (title + url). 
- Recommend up to 3 songs (title + artist).
Respond strictly in JSON: { suggestions:[{suggestionType,text,score}], videos:[{title,url}], songs:[{title,artist}] }`;

      try {
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful, human-like assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 800,
        });

        const txt = response.choices?.[0]?.message?.content || '';
        let parsed = {};
        try {
          parsed = JSON.parse(txt);
        } catch (e) {
          console.warn('parse failed', e.message);
        }

        if (parsed.suggestions && user) {
          // only save if user is logged in
          const docs = parsed.suggestions.map((s) => ({
            userId: user._id,
            suggestionType: s.suggestionType || 'ai',
            text: s.text,
            data: s,
            score: s.score || 0.5,
            source: 'ai',
          }));
          await Suggestion.insertMany(docs);
        }

        return res.json(parsed);
      } catch (e) {
        console.warn('OpenAI call failed:', e.message);
      }
    }

    // 🔴 If no API key or AI failed
    const fallback = await youtubeFallback(notes);
    return res.status(503).json({
      error: 'AI service unavailable. Please contact creator at t.madhansingh23@gmail.com',
      ...fallback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
