const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 10
  },
  group: {
    type: String,
    required: true,
    enum: ['energy', 'work', 'psychology', 'environment']
  },
  question: {
    type: String,
    required: true
  },
  hint: {
    type: String,
    default: ''
  },
  options: [{
    label: { type: String, required: true },
    emoji: { type: String, default: '' },
    subtext: { type: String, default: '' },
    score: { type: Number, required: true, min: 1, max: 5 }
  }],
  order: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Question', questionSchema);