const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'major', 'minor', 'suggestion'],
    default: 'suggestion'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  appVersion: String,
  deviceInfo: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'closed'],
    default: 'pending'
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);