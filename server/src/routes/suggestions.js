
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Suggestion = require('../models/Suggestion');
const { generateRules } = require('../utils/suggestionRules');
const Event = require('../models/Event');

router.get('/', auth, async (req, res) => {
  try { const suggestions = await Suggestion.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100); res.json(suggestions); }
  catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.post('/generate', auth, async (req, res) => {
  try {
    const stats = req.body.stats || {};
    if(Object.keys(stats).length === 0) {
      const events = await Event.find({ userId: req.user._id, start: { $gte: new Date(Date.now() - 7*24*3600*1000) } });
      let meetingMinutes=0, totalWorkMinutes=0, sessionTotal=0, sessionCount=0;
      events.forEach(e=>{ const s=new Date(e.start), t=new Date(e.end||e.start); const mins=Math.max(0,(t-s)/60000); totalWorkMinutes+=mins; if(e.type==='calendar' && e.meta?.category==='meeting') meetingMinutes+=mins; sessionTotal+=mins; if(mins>0) sessionCount++; });
      stats.meetingMinutes=meetingMinutes; stats.totalWorkMinutes=totalWorkMinutes; stats.avgSession=sessionCount?sessionTotal/sessionCount:0; stats.openTasks=req.body.openTasks||0; stats.taskCompletionRate=req.body.taskCompletionRate||1;
    }
    const rules = generateRules(stats);
    const docs = rules.map(r=>({ userId:req.user._id, suggestionType:r.suggestionType, text:r.text, data:r, score:r.score, source:r.source }));
    const created = await Suggestion.insertMany(docs);
    res.json(created);
  } catch(err){ console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;
