const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Support both string IDs (from project 1) and ObjectId refs (from project 2)
  staffId: {
    type: String,
    required: true
  },
  childId: {
    type: String,
    required: true
  },
  // Also support ObjectId references
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['meal', 'nap', 'activity', 'update']
  },
  activityType: {
    type: String,
    enum: ['meal', 'nap', 'activity', 'update']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  photos: [{
    type: String,
    default: []
  }],
  date: {
    type: Date,
    default: Date.now
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  details: {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snack', 'dinner', '']
    },
    napDuration: Number,
    activityType: {
      type: String,
      enum: ['indoor', 'outdoor', 'learning', 'creative', 'physical', '']
    },
    mood: {
      type: String,
      enum: ['happy', 'sleepy', 'cranky', 'peaceful', 'active', '']
    },
    foodItems: [String],
    quantity: {
      type: String,
      enum: ['all', 'most', 'half', 'little', 'none', '']
    }
  },
  meta: {
    mood: String,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
activitySchema.index({ staffId: 1, timestamp: -1 });
activitySchema.index({ childId: 1, timestamp: -1 });
activitySchema.index({ child: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
