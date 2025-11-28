// src/index.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const { initSocket } = require('./socket');
const initCronJobs = require('./utils/cron');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
// const eventsRoutes = require('./routes/events'); // Commented out if not used yet
// const suggestionsRoutes = require('./routes/suggestions'); // Commented out if not used yet
// const aiRoutes = require('./routes/ai'); // Commented out if not used yet
// const profileRoutes = require('./routes/profile'); // Commented out if not used yet
const userRoutes = require("./routes/users");
const contactRoutes = require("./routes/contact");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173", // Vite default
  "http://127.0.0.1:5173",
  "https://smart-productivity-tracker-blush.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("Blocked by CORS:", origin);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
}));

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// ... imports ...

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '5mb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// static for images
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    immutable: true,
  })
);

// Initialize Socket.io
const io = initSocket(server, allowedOrigins);
app.set('io', io);

// Initialize Cron Jobs
initCronJobs();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai", require("./routes/ai"));

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_prod';

mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo connected');
    server.listen(PORT, () => console.log('Server running on', PORT));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
