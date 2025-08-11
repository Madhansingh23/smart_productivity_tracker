
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const eventsRoutes = require('./routes/events');
const suggestionsRoutes = require('./routes/suggestions');
const aiRoutes = require('./routes/ai');
const cron = require('node-cron');
const Task = require('./models/Task');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/ai', aiRoutes);
app.get('/api/health', (req,res)=> res.json({ok:true}));
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_prod';
mongoose.connect(MONGO, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=> {
  console.log('Mongo connected', MONGO);
  app.listen(PORT, ()=> console.log('Server running on', PORT));
})
.catch(err => { console.error(err); process.exit(1); });
// simple cron to mark reminders (placeholder)
cron.schedule('* * * * *', async ()=>{
  try {
    // placeholder: would check remindAt and send notifications
    // console.log('cron tick', new Date().toISOString());
  } catch(e){ console.error('cron err', e); }
});
