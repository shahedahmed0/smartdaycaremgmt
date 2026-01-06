const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDailyReport, getDateRangeReport } = require('../controllers/reportController');

// All routes require authentication
router.use(protect);

// Get daily report for a child
router.get('/daily/:childId', getDailyReport);

// Get report for date range
router.get('/range/:childId', getDateRangeReport);

module.exports = router;
