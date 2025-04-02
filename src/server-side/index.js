import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Routes
import { UserRouter } from "./routes.js/user.js";
import { UpdateProfileRouter } from "./routes.js/update-profile.js";
import { StatisticsRouter } from "./routes.js/statistics.js";
import { RoadmapRouter } from "./routes.js/roadmap.js";
import documentRoutes from "./routes/documentRoutes.js";

// Models
import { User } from "./models/user.js";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve files from uploads directory - IMPORTANT for document/resume viewing
console.log(`Serving static files from: ${uploadsDir}`);
app.use('/uploads', express.static(uploadsDir));

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Basic middleware - removed security restrictions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Updated CORS configuration to handle credentials
app.use((req, res, next) => {
  // Allow specific origin instead of wildcard for credentials to work
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, user-email');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Simple request logging without security checks
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes - security removed from all routes
app.use("/auth", UserRouter);
app.use("/profile", UpdateProfileRouter);
app.use("/statistics", StatisticsRouter);
app.use("/roadmap", RoadmapRouter);
app.use("/auth/documents", documentRoutes);

// Serve static files from the React app build folder in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../build');
  app.use(express.static(buildPath));

  // For any route that is not an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
} else {
  console.log('Running in development mode - using proxy for frontend');
}

// Simple error handler - removed security details
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Resource not found'
  });
});

// Function to create test users if they don't exist
const createTestUsers = async () => {
  try {
    // Check if test user already exists
    const testUserExists = await User.findOne({ email: 'test@example.com' });
    const adminUserExists = await User.findOne({ email: 'admin@example.com' });
    
    // If both users exist, return
    if (testUserExists && adminUserExists) {
      console.log('Test users already exist in database');
      return;
    }
    
    // Create test user if it doesn't exist
    if (!testUserExists) {
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        contactNumber: '1234567890',
        sapId: 'TEST001',
        rollNo: 'R001',
        gender: 'Other',
        dob: new Date('1998-01-01'),
        tenthPercentage: 85,
        tenthSchool: 'Test School',
        twelfthPercentage: 80,
        twelfthCollege: 'Test College',
        graduationCollege: 'Test University',
        graduationCGPA: 8.5,
        stream: 'Computer Engineering',
        sixthSemesterCGPA: 8.0,
        isAdmin: false,
        skills: 'JavaScript, React, Node.js',
        projects: 'CareerConnect',
        careerPreferences: {
          interestedCompanies: ['Google', 'Microsoft'],
          interestedRoles: ['Software Developer', 'Web Developer'],
          interestedSkills: ['JavaScript', 'React', 'Node.js'],
          careerGoals: 'To become a full-stack developer'
        }
      });
      
      await testUser.save();
      console.log('Test user created');
    }
    
    // Create admin user if it doesn't exist
    if (!adminUserExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        contactNumber: '9876543210',
        sapId: 'ADMIN001',
        rollNo: 'A001',
        gender: 'Other',
        dob: new Date('1990-01-01'),
        tenthPercentage: 90,
        tenthSchool: 'Admin School',
        twelfthPercentage: 85,
        twelfthCollege: 'Admin College',
        graduationCollege: 'Admin University',
        graduationCGPA: 9.0,
        stream: 'Computer Engineering',
        sixthSemesterCGPA: 8.5,
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Error creating test users:', error);
  }
};

// Connect to the database and start server - removed security configurations
(async () => {
  try {
    // Use the exact case that already exists in MongoDB to avoid case sensitivity error
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect', {
      // Add these options to handle case sensitivity properly
      authSource: 'admin',
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB connected successfully`);
    
    // Create test users
    await createTestUsers();
    
    // Start server after database connection
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
})();
