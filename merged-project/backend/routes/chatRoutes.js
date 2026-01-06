const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Protect all chat routes
router.use(protect);

// Create a new chat
router.post('/', async (req, res) => {
  try {
    const { participant1, participant2 } = req.body;
    
    const existingChat = await Chat.findOne({
      $and: [
        { 'participants.id': participant1.id },
        { 'participants.id': participant2.id }
      ]
    });
    
    if (existingChat) {
      return res.json({
        success: true,
        data: { chat: existingChat },
        message: 'Chat already exists'
      });
    }
    
    const chat = new Chat({
      participants: [participant1, participant2],
      lastMessageTime: new Date(),
      unreadCount: 0
    });
    
    await chat.save();
    
    res.status(201).json({
      success: true,
      data: { chat },
      message: 'Chat created successfully'
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
});

// Get user's chats
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find chats where user is a participant (check both participant1 and participant2)
    const chats = await Chat.find({
      $or: [
        { 'participants.id': userId },
        { 'participants.id': userId.toString() }
      ]
    })
    .sort({ lastMessageTime: -1 })
    .lean();
    
    const formattedChats = chats.map(chat => ({
      _id: chat._id,
      participants: chat.participants || [],
      lastMessageTime: chat.lastMessageTime,
      lastMessage: chat.lastMessage || '',
      unreadCount: chat.unreadCount || 0,
      createdAt: chat.createdAt
    }));
    
    res.json({
      success: true,
      data: { chats: formattedChats },
      message: 'Chats retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// Get messages for a chat
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 100, skip = 0 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    res.json({
      success: true,
      data: { messages },
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Save a message
router.post('/messages', async (req, res) => {
  try {
    const { chatId, senderId, senderRole, content, timestamp } = req.body;
    
    if (!chatId || !senderId || !senderRole || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    const message = new Message({
      chatId,
      senderId,
      senderRole,
      content: content.trim(),
      timestamp: timestamp || new Date(),
      read: false
    });
    
    await message.save();
    
    await Chat.findByIdAndUpdate(chatId, {
      lastMessageTime: new Date(),
      lastMessage: content.length > 100 ? content.substring(0, 100) + '...' : content,
      $inc: { unreadCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      data: { message },
      message: 'Message saved successfully'
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save message',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/:chatId/read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    await Message.updateMany(
      { 
        chatId, 
        senderId: { $ne: userId }
      },
      { 
        $set: { read: true },
        $addToSet: { 
          readBy: { 
            userId, 
            readAt: new Date() 
          } 
        }
      }
    );
    
    await Chat.findByIdAndUpdate(chatId, {
      unreadCount: 0
    });
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Delete a chat
router.delete('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    await Message.deleteMany({ chatId });
    await Chat.findByIdAndDelete(chatId);
    
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
});

module.exports = router;
