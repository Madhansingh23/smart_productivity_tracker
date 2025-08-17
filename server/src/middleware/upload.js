// src/middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // keep file in memory instead of disk
const upload = multer({ storage });

module.exports = upload;
