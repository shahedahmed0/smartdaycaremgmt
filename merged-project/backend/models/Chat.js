const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['parent', 'staff']
  },
  name: {
    type: String,
    required: true
  }
});

const chatSchema = new mongoose.Schema({
  participants: [participantSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: String,
    default: ''
  },
  unreadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
chatSchema.index({ 'participants.id': 1 });
chatSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Chat', chatSchema);
