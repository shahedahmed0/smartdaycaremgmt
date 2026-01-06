const Activity = require('../models/Activity');
const Child = require('../models/Child');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Generate daily report for a child
// @route   GET /api/reports/daily/:childId
// @access  Private (parent/staff)
exports.getDailyReport = async (req, res) => {
  try {
    const { childId } = req.params;
    const { date } = req.query; // Optional: YYYY-MM-DD format

    // Parse date or use today
    let targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Verify child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child not found'
      });
    }

    // Check if parent owns this child or staff is assigned
    const userId = req.user._id.toString();
    if (req.user.role === 'parent') {
      const parentId = child.parent?.toString();
      if (parentId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    } else if (req.user.role === 'staff') {
      const caregiverId = child.caregiver?.toString();
      if (caregiverId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Get all activities for the day
    const activities = await Activity.find({
      childId: childId,
      $or: [
        { timestamp: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
        { date: { $gte: startOfDay, $lte: endOfDay } }
      ]
    }).sort({ timestamp: 1, createdAt: 1 });

    // Get attendance record for the day
    const attendance = await Attendance.findOne({
      child: childId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Categorize activities
    const meals = activities.filter(a => a.type === 'meal' || a.activityType === 'meal');
    const naps = activities.filter(a => a.type === 'nap' || a.activityType === 'nap');
    const activities_list = activities.filter(a => a.type === 'activity' || a.activityType === 'activity');
    const updates = activities.filter(a => a.type === 'update' || a.activityType === 'update');

    // Collect all photos
    const allPhotos = [];
    activities.forEach(activity => {
      if (activity.photos && Array.isArray(activity.photos)) {
        activity.photos.forEach(photo => {
          allPhotos.push({
            url: photo,
            activityId: activity._id,
            activityTitle: activity.title,
            timestamp: activity.timestamp || activity.createdAt
          });
        });
      }
    });

    // Calculate meal summary
    const mealSummary = {
      breakfast: meals.filter(m => m.details?.mealType === 'breakfast').length,
      lunch: meals.filter(m => m.details?.mealType === 'lunch').length,
      snack: meals.filter(m => m.details?.mealType === 'snack').length,
      dinner: meals.filter(m => m.details?.mealType === 'dinner').length,
      total: meals.length
    };

    // Calculate nap summary
    const napSummary = {
      count: naps.length,
      totalDuration: naps.reduce((sum, nap) => sum + (nap.details?.napDuration || 0), 0),
      averageDuration: naps.length > 0 
        ? Math.round(naps.reduce((sum, nap) => sum + (nap.details?.napDuration || 0), 0) / naps.length)
        : 0
    };

    // Get staff member names
    const staffIds = [...new Set(activities.map(a => a.staffId || a.createdBy?.toString()).filter(Boolean))];
    const staffMembers = await User.find({ 
      _id: { $in: staffIds } 
    }).select('name staffRole');

    const staffMap = {};
    staffMembers.forEach(staff => {
      staffMap[staff._id.toString()] = staff.name;
    });

    // Build report
    const report = {
      child: {
        id: child._id,
        name: child.name,
        age: child.age,
        photo: child.photo
      },
      date: targetDate.toISOString().split('T')[0],
      attendance: attendance ? {
        checkedIn: attendance.checkedIn,
        checkInTime: attendance.checkInTime,
        checkedOut: attendance.checkedOut,
        checkOutTime: attendance.checkOutTime,
        extraServices: attendance.extraServices || [],
        mealsServed: attendance.mealsServed || {}
      } : null,
      summary: {
        totalActivities: activities.length,
        meals: mealSummary,
        naps: napSummary,
        activities: activities_list.length,
        updates: updates.length,
        photos: allPhotos.length
      },
      activities: {
        meals: meals.map(m => ({
          id: m._id,
          title: m.title,
          description: m.description,
          time: m.timestamp || m.createdAt,
          mealType: m.details?.mealType,
          foodItems: m.details?.foodItems || [],
          quantity: m.details?.quantity,
          photos: m.photos || [],
          staffName: staffMap[m.staffId || m.createdBy?.toString()] || 'Unknown'
        })),
        naps: naps.map(n => ({
          id: n._id,
          title: n.title,
          description: n.description,
          time: n.timestamp || n.createdAt,
          duration: n.details?.napDuration,
          mood: n.details?.mood || n.meta?.mood,
          photos: n.photos || [],
          staffName: staffMap[n.staffId || n.createdBy?.toString()] || 'Unknown'
        })),
        activities: activities_list.map(a => ({
          id: a._id,
          title: a.title,
          description: a.description,
          time: a.timestamp || a.createdAt,
          activityType: a.details?.activityType,
          photos: a.photos || [],
          staffName: staffMap[a.staffId || a.createdBy?.toString()] || 'Unknown'
        })),
        updates: updates.map(u => ({
          id: u._id,
          title: u.title,
          description: u.description,
          time: u.timestamp || u.createdAt,
          photos: u.photos || [],
          staffName: staffMap[u.staffId || u.createdBy?.toString()] || 'Unknown'
        }))
      },
      photos: allPhotos,
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate daily report'
    });
  }
};

// @desc    Get report for date range
// @route   GET /api/reports/range/:childId
// @access  Private (parent/staff)
exports.getDateRangeReport = async (req, res) => {
  try {
    const { childId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide startDate and endDate (YYYY-MM-DD format)'
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Verify child exists and access
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child not found'
      });
    }

    const userId = req.user._id.toString();
    if (req.user.role === 'parent') {
      const parentId = child.parent?.toString();
      if (parentId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Get activities in range
    const activities = await Activity.find({
      childId: childId,
      $or: [
        { timestamp: { $gte: start, $lte: end } },
        { createdAt: { $gte: start, $lte: end } },
        { date: { $gte: start, $lte: end } }
      ]
    }).sort({ timestamp: 1, createdAt: 1 });

    // Group by date
    const dailyReports = {};
    activities.forEach(activity => {
      const date = (activity.timestamp || activity.createdAt || activity.date).toISOString().split('T')[0];
      if (!dailyReports[date]) {
        dailyReports[date] = [];
      }
      dailyReports[date].push(activity);
    });

    res.status(200).json({
      success: true,
      data: {
        child: {
          id: child._id,
          name: child.name
        },
        startDate: startDate,
        endDate: endDate,
        totalActivities: activities.length,
        dailyBreakdown: dailyReports
      }
    });

  } catch (error) {
    console.error('Get date range report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate date range report'
    });
  }
};
