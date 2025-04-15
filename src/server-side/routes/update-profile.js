import express from "express";
import { User } from "../models/user.js";
import multer from "multer";
import fs from "fs";
import path from "path";
const router = express.Router();

// Configure multer for file uploads without restrictions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage
});

// Update profile - no authentication
router.post("/update", async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    const userData = req.body;
    
    // Find and update user without validation
    const user = await User.findByIdAndUpdate(
      userId, 
      userData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Upload resume - no authentication or validation
router.post("/resume", upload.single('resume'), async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }
    
    console.log(`Uploading resume for user ${userId}, file: ${req.file.originalname}`);
    
    // Update user with resume
    const user = await User.findByIdAndUpdate(
      userId,
      {
        resume: {
          filename: req.file.originalname,
          path: req.file.path,
          contentType: req.file.mimetype,
          size: req.file.size,
          uploadDate: new Date()
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`Resume uploaded successfully for user ${userId}`);
    return res.json({ 
      message: "Resume uploaded successfully",
      resume: {
        filename: user.resume.filename,
        contentType: user.resume.contentType,
        uploadDate: user.resume.uploadDate
      }
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Download resume - no authentication
router.get("/resume/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    
    if (!user || !user.resume) {
      console.error(`Resume not found for userId: ${userId}`);
      return res.status(404).json({ message: "Resume not found" });
    }
    
    // Check if the file exists
    if (!user.resume.path || !fs.existsSync(user.resume.path)) {
      console.error(`Resume file not found on server: ${user.resume.path}`);
      return res.status(404).json({ message: "Resume file not found on server" });
    }
    
    console.log(`Serving resume for user ${userId}, file: ${user.resume.path}`);
    
    // Determine content type based on file extension
    const ext = path.extname(user.resume.filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // Set content type
    res.setHeader('Content-Type', contentType);
    
    // Set content disposition based on query parameter
    const download = req.query.download === 'true';
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="${user.resume.filename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${user.resume.filename}"`);
    }
    
    // Send the file
    const fullPath = path.resolve(user.resume.path);
    console.log(`Sending file from path: ${fullPath}`);
    res.sendFile(fullPath);
  } catch (error) {
    console.error("Error downloading resume:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update profile picture - no authentication
router.post("/profilePicture", upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }
    
    // Update user with profile picture
    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: {
          filename: req.file.originalname,
          path: req.file.path
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ message: "Profile picture uploaded successfully" });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get profile picture - no authentication
router.get("/profilePicture/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: "Profile picture not found" });
    }
    
    // Send profile picture
    res.sendFile(user.profilePicture.path);
  } catch (error) {
    console.error("Error retrieving profile picture:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export { router as UpdateProfileRouter };