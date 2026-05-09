const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  // Quiz answers
  answers: [{
    questionId: { type: Number, required: true },
    group: { 
      type: String, 
      enum: ['energy', 'work', 'psychology', 'environment'],
      required: true 
    },
    selectedOption: { type: Number, required: true }, // 0-4 index
    score: { type: Number, required: true, min: 1, max: 5 }
  }],
  
  // Scoring results
  scores: {
    energy: { type: Number, min: 0, max: 100 },
    work: { type: Number, min: 0, max: 100 },
    psychology: { type: Number, min: 0, max: 100 },
    environment: { type: Number, min: 0, max: 100 },
    total: { type: Number, min: 0, max: 100 }
  },
  
  // Final state classification
  state: {
    type: String,
    enum: [
      'exhausted',        // Kiệt sức
      'tired',            // Mệt mỏi
      'lazy_with_deadline', // Lười có deadline
      'ready',            // Sẵn sàng
      'focused',          // Tập trung
      'unmotivated'       // Mất động lực
    ],
    required: true
  },
  
  stateDetails: {
    name: String,
    emoji: String,
    color: String,
    description: String,
    recommendations: [String]
  },
  
  meta: {
    completionTime: Number, // in seconds
    deviceInfo: String,
    appVersion: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient querying
historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);