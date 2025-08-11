
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

router.post('/suggest', auth, async (req, res) => {
  try {
    const stats = req.body.stats || {};
    const notes = req.body.notes || '';
    if (openaiClient) {
      const prompt = `You are a bilingual productivity assistant (English & Tamil). Given stats: ${JSON.stringify(stats)} and notes: ${JSON.stringify(notes)}, produce up to 5 suggestions and 3 YouTube video recommendations (title + url) and 3 song recommendations (title + artist). Output strict JSON: { suggestions:[{suggestionType,text,score}], videos:[{title,url}], songs:[{title,artist}] }`;
      try {
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.'},
            { role: 'user', content: prompt }
          ],
          max_tokens: 800
        });
        const txt = response.choices?.[0]?.message?.content || '';
        let parsed = {};
        try { parsed = JSON.parse(txt); } catch(e){ console.warn('parse failed', e); }
        if(parsed.suggestions) {
          const docs = parsed.suggestions.map(s=>({ userId:req.user._id, suggestionType:s.suggestionType||'ai', text:s.text, data:s, score:s.score||0.5, source:'ai' }));
          await Suggestion.insertMany(docs);
        }
        return res.json(parsed);
      } catch(e){ console.warn('OpenAI call failed', e.message); }
    }
    const rules = generateRules(stats);
    let videos = [];
    if(youtubeKey && notes) {
      try {
        const q = encodeURIComponent(notes);
        const r = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&key=${youtubeKey}&maxResults=3`);
        videos = r.data.items.map(it=>({ title: it.snippet.title, url: 'https://www.youtube.com/watch?v='+(it.id.videoId||it.id.channelId) }));
      } catch(err){ console.warn('YouTube search failed', err.message); }
    }
    res.json({ suggestions: rules, videos, songs: [] });
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;
