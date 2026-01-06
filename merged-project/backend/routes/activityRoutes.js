const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const path = require('path');

// CREATE Activity
router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    const { staffId, childId, type, title, description, ...details } = req.body;
    
    if (!staffId || !childId || !type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const activity = new Activity({
      staffId,
      childId,
      type,
      title,
      description,
      photos: photoPaths,
      details: {
        mealType: details.mealType || '',
        napDuration: details.napDuration ? parseInt(details.napDuration) : undefined,
        activityType: details.activityType || '',
        mood: details.mood || '',
        foodItems: details.foodItems ? details.foodItems.split(',').map(item => item.trim()) : [],
        quantity: details.quantity || ''
      }
    });

    await activity.save();

    // Create notification for parent
    try {
      const parentId = req.body.parentId || 'PARENT001';
      const notification = new Notification({
        parentId,
        childId,
        type: 'activity',
        title: `New ${type} Activity`,
        message: `${title} - ${description.substring(0, 80)}...`,
        priority: type === 'update' ? 'medium' : 'low',
        activityId: activity._id,
        metadata: {
          source: 'staff',
          staffId: staffId,
          timestamp: new Date()
        }
      });
      
      await notification.save();
      console.log(`📢 Notification created for parent ${parentId}`);
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message
    });
  }
});

// READ Activities for Staff
router.get('/staff/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const { type, limit = 20 } = req.query;
    
    const query = { staffId };
    if (type && type !== 'all') {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching staff activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

// READ Activities for Parent
router.get('/parent/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    const { filter = 'all', limit = 50 } = req.query;
    
    const query = { childId };
    if (filter && filter !== 'all') {
      query.type = filter;
    }

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching parent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

// READ Daily Summary for Child
router.get('/summary/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const activities = await Activity.find({
      childId,
      $or: [
        { timestamp: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    });

    const meals = activities.filter(a => a.type === 'meal');
    const naps = activities.filter(a => a.type === 'nap');
    
    let photoCount = 0;
    activities.forEach(activity => {
      if (activity.photos && Array.isArray(activity.photos)) {
        photoCount += activity.photos.length;
      }
    });

    res.json({
      success: true,
      data: {
        total: activities.length,
        meals: meals.length,
        naps: naps.length,
        photos: photoCount
      }
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
});

// Emergency alert endpoint
router.post('/:childId/emergency', async (req, res) => {
  try {
    const { childId } = req.params;
    const { staffId, emergencyType, details, symptoms, severity, parentId } = req.body;
    
    const notification = new Notification({
      parentId: parentId || 'PARENT001',
      childId,
      type: 'emergency',
      title: `🚨 ${emergencyType === 'illness' ? 'Health Alert' : 'Emergency Alert'}`,
      message: emergencyType === 'illness' 
        ? `${childId}: ${symptoms}. Severity: ${severity}`
        : details,
      priority: 'urgent',
      metadata: {
        source: 'staff',
        emergencyType,
        symptoms,
        severity,
        timestamp: new Date()
      }
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Emergency notification sent to parent',
      data: notification
    });
    
  } catch (error) {
    console.error('Error creating emergency notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency notification'
    });
  }
});

// Pickup reminder endpoint
router.post('/:childId/pickup-reminder', async (req, res) => {
  try {
    const { childId } = req.params;
    const { pickupTime, parentId } = req.body;
    
    const formattedTime = new Date(pickupTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const notification = new Notification({
      parentId: parentId || 'PARENT001',
      childId,
      type: 'reminder',
      title: `⏰ Pickup Reminder`,
      message: `Don't forget to pick up ${childId} at ${formattedTime}`,
      priority: 'high',
      metadata: {
        source: 'system',
        reminderType: 'pickup',
        pickupTime,
        timestamp: new Date()
      }
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Pickup reminder scheduled',
      data: notification
    });
    
  } catch (error) {
    console.error('Error creating pickup reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule pickup reminder'
    });
  }
});

// DELETE Activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Activity.findByIdAndDelete(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity'
    });
  }
});

module.exports = router;
