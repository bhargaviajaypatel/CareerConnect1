import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import applySecurityMiddleware from './middleware/security.js';
import cors from 'cors';

// Routes
import { UserRouter } from "./routes/user.js";
import { UpdateProfileRouter } from "./routes/update-profile.js";
import { StatisticsRouter } from "./routes/statistics.js";
import { RoadmapRouter } from "./routes/roadmap.js";
import documentRoutes from "./routes/documentRoutes.js";

// Models
import { User } from "./models/user.js";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply all security middleware using the imported function
applySecurityMiddleware(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve files from uploads directory
console.log(`Serving static files from: ${uploadsDir}`);
app.use('/uploads', express.static(uploadsDir));

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/auth", UserRouter);
app.use("/profile", UpdateProfileRouter);
app.use("/statistics", StatisticsRouter);
app.use("/roadmap", RoadmapRouter);
app.use("/auth/documents", documentRoutes);

// Basic route to test server
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Serve static files from the React app build folder in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(process.cwd(), 'build');
  app.use(express.static(buildPath));

  // For any route that is not an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
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

// Connect to the database and start server
(async () => {
  console.log('[DB] Starting database connection process...');
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 5000, // Revert to slightly longer timeout
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
      heartbeatFrequencyMS: 5000, // Less frequent heartbeat
      // family: 4 // Temporarily removed
    };

    console.log(`[DB] Attempting connection to mongodb://localhost:27017/CareerConnect with options: ${JSON.stringify(mongoOptions)}`);
    
    await mongoose.connect('mongodb://localhost:27017/CareerConnect', mongoOptions);
    
    console.log('[DB] Mongoose connect call completed.');

    // Check connection state explicitly
    if (mongoose.connection.readyState === 1) {
      console.log('[DB] MongoDB connected successfully!');
    } else {
      console.error('[DB] Mongoose connected, but readyState is not 1. State:', mongoose.connection.readyState);
      throw new Error('MongoDB connection failed post-connect call.');
    }

    // Add listeners for connection events AFTER initial attempt
    mongoose.connection.on('error', (err) => {
      console.error('[DB Event] MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.log('[DB Event] MongoDB disconnected.');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('[DB Event] MongoDB reconnected.');
    });

    console.log('[Server] Proceeding to start Express server...');
    const PORT = process.env.SERVER_PORT || 4000;
    app.listen(PORT, () => {
      console.log(`[Server] Express server listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('\n[Error] Server initialization failed:', error);
    console.error('\nTroubleshooting steps:');
    console.error('1. MongoDB Service Status:');
    console.error('   - Ensure MongoDB service is RUNNING (check services.msc or MongoDB Compass).');
    console.error('   - MongoDB Compass shows connection: Yes');
    console.error('2. Network/Firewall:');
    console.error('   - Verify no firewall is blocking Node.js from accessing port 27017.');
    console.error('   - Connection URL used: mongodb://localhost:27017/CareerConnect');
    console.error('3. Mongoose/Driver Issue:');
    console.error('   - Check compatibility between Mongoose, Node.js, and MongoDB versions.');
    process.exit(1);
  }
})();
