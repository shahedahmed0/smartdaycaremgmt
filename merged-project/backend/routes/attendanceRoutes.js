const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getChildAttendance,
  getAttendanceStatus
} = require('../controllers/attendanceController');

// All routes require authentication
router.use(protect);

// Check-in a child (staff only)
router.post('/check-in', authorize('staff', 'admin'), checkIn);

// Check-out a child (staff only)
router.post('/check-out', authorize('staff', 'admin'), checkOut);

// Get today's attendance (staff and admin)
router.get('/today', authorize('staff', 'admin'), getTodayAttendance);

// Get attendance for a specific child (parent, staff, admin)
router.get('/child/:childId', getChildAttendance);

// Get attendance status for a child today
router.get('/status/:childId', getAttendanceStatus);

module.exports = router;
