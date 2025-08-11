
const mongoose = require('mongoose');
const suggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  suggestionType: String,
  text: String,
  data: Object,
  score: Number,
  source: { type: String, enum:['ai','rule'] },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Suggestion', suggestionSchema);
