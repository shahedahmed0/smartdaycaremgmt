const Attendance = require('../models/Attendance');
const Child = require('../models/Child');

// Check-in a child
exports.checkIn = async (req, res) => {
  try {
    const { childId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      child: childId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Child already checked in today'
      });
    }

    const attendance = await Attendance.create({
      child: childId,
      date: new Date(),
      checkInTime: new Date()
    });

    await attendance.populate('child');

    res.status(201).json({
      success: true,
      message: 'Child checked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in child',
      error: error.message
    });
  }
};

// Check-out a child
exports.checkOut = async (req, res) => {
  try {
    const { childId, extraServiceCharge, meals } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      child: childId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      checkOutTime: null
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    attendance.checkOutTime = new Date();
    if (extraServiceCharge !== undefined) {
      attendance.extraServiceCharge = extraServiceCharge;
    }
    if (meals && Array.isArray(meals)) {
      attendance.meals = meals;
    }

    await attendance.save();
    await attendance.populate('child');

    res.json({
      success: true,
      message: 'Child checked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out child',
      error: error.message
    });
  }
};

// Get today's attendance
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('child').sort({ checkInTime: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

// Get attendance for a specific child
exports.getChildAttendance = async (req, res) => {
  try {
    const { childId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { child: childId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('child')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch child attendance',
      error: error.message
    });
  }
};

// Get attendance status (checked in/out) for a child today
exports.getAttendanceStatus = async (req, res) => {
  try {
    const { childId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      child: childId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        isCheckedIn: !!attendance,
        isCheckedOut: !!attendance?.checkOutTime,
        attendance: attendance || null
      }
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance status',
      error: error.message
    });
  }
};
