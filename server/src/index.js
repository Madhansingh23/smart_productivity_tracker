// src/index.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const eventsRoutes = require('./routes/events');
const suggestionsRoutes = require('./routes/suggestions');
const aiRoutes = require('./routes/ai');
const profileRoutes = require('./routes/profile');
const userRoutes = require("./routes/users");

const app = express();

// CORS & basics
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// static for images (cache for a week)
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    immutable: true,
  })
);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/users", userRoutes); 


// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
const MONGO =
  process.env.MONGO_URI || 'mongodb://localhost:27017/smart_prod';

mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo connected', MONGO);
    app.listen(PORT, () => console.log('Server running on', PORT));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// cron placeholder
cron.schedule('* * * * *', async () => {
  try {
    // reminders etc.
  } catch (e) {
    console.error('cron err', e);
  }
});
