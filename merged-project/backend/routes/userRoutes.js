const express = require('express');
const router = express.Router();
const upload = require('../config/upload');

const { protect, authorize } = require('../middleware/auth');
const { 
  createStaff, 
  getStaff, 
  deleteUser, 
  getUsersForChat,
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto
} = require('../controllers/userController');

// Staff management (admin only)
router.get('/staff', protect, authorize('admin'), getStaff);
router.post('/staff', protect, authorize('admin'), createStaff);

// Get users for chat (parent/staff can see each other)
router.get('/chat-users', protect, getUsersForChat);

// Staff profile management (staff only)
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateMyProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);

// Generic user delete (admin only)
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
