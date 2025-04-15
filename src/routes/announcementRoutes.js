const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all active announcements (public route)
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(3); // Limit to 3 most recent announcements for homepage
    
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin routes - protected by auth and admin middleware
// Get all announcements (including inactive ones) - Admin only
router.get('/admin/announcements', auth, adminAuth, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching admin announcements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new announcement - Admin only
router.post('/admin/announcements', auth, adminAuth, async (req, res) => {
  try {
    const { title, description, link, active } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and description are required' 
      });
    }
    
    const newAnnouncement = new Announcement({
      title,
      description,
      link: link || '#',
      active: active !== undefined ? active : true
    });
    
    await newAnnouncement.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Announcement created successfully',
      announcement: newAnnouncement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an announcement - Admin only
router.put('/admin/announcements/:id', auth, adminAuth, async (req, res) => {
  try {
    const { title, description, link, active } = req.body;
    const announcementId = req.params.id;
    
    // Find the announcement
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    // Update fields if provided
    if (title) announcement.title = title;
    if (description) announcement.description = description;
    if (link !== undefined) announcement.link = link;
    if (active !== undefined) announcement.active = active;
    
    await announcement.save();
    
    res.json({ 
      success: true, 
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete an announcement - Admin only
router.delete('/admin/announcements/:id', auth, adminAuth, async (req, res) => {
  try {
    const announcementId = req.params.id;
    
    const result = await Announcement.findByIdAndDelete(announcementId);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Announcement deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
