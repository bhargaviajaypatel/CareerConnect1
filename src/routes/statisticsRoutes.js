const express = require('express');
const router = express.Router();
const PlacementStatistic = require('../models/PlacementStatistic');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get latest placement statistics (public route)
router.get('/statistics/placements', async (req, res) => {
  try {
    // Get the most recent statistics entry
    const latestStats = await PlacementStatistic.findOne().sort({ lastUpdated: -1 });
    
    if (!latestStats) {
      return res.status(404).json({ 
        success: false, 
        message: 'No statistics found' 
      });
    }
    
    // Format the statistics for the frontend
    const statistics = {
      studentsPlaced: latestStats.studentsPlaced.value,
      studentsPlacedIncrease: latestStats.studentsPlaced.increase,
      averagePackage: latestStats.averagePackage.value,
      averagePackageIncrease: latestStats.averagePackage.increase,
      successRate: latestStats.successRate.value,
      successRateIncrease: latestStats.successRate.increase,
      campusRecruiters: latestStats.campusRecruiters.value,
      campusRecruitersIncrease: latestStats.campusRecruiters.increase,
      lastUpdated: latestStats.lastUpdated
    };
    
    res.json({ success: true, statistics });
  } catch (error) {
    console.error('Error fetching placement statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin routes - protected by auth and admin middleware
// Get all statistics entries - Admin only
router.get('/admin/statistics/placements', auth, adminAuth, async (req, res) => {
  try {
    const allStats = await PlacementStatistic.find().sort({ lastUpdated: -1 });
    res.json({ success: true, statistics: allStats });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create or update placement statistics - Admin only
router.post('/admin/statistics/placements', auth, adminAuth, async (req, res) => {
  try {
    const { 
      studentsPlaced, 
      studentsPlacedIncrease, 
      averagePackage, 
      averagePackageIncrease,
      successRate,
      successRateIncrease,
      campusRecruiters,
      campusRecruitersIncrease
    } = req.body;
    
    // Validate required fields
    if (!studentsPlaced || !averagePackage || !successRate || !campusRecruiters) {
      return res.status(400).json({ 
        success: false, 
        message: 'All statistics values are required' 
      });
    }
    
    // Create a new statistics entry
    const newStats = new PlacementStatistic({
      studentsPlaced: {
        value: studentsPlaced,
        increase: studentsPlacedIncrease || "0%"
      },
      averagePackage: {
        value: averagePackage,
        increase: averagePackageIncrease || "0%"
      },
      successRate: {
        value: successRate,
        increase: successRateIncrease || "0%"
      },
      campusRecruiters: {
        value: campusRecruiters,
        increase: campusRecruitersIncrease || "0%"
      },
      lastUpdated: new Date()
    });
    
    await newStats.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Statistics updated successfully',
      statistics: newStats
    });
  } catch (error) {
    console.error('Error updating statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
