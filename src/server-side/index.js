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

// Apply all security middleware
applySecurityMiddleware(app);

// Set up uploads directory for file storage
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
console.log(`Serving static files from: ${uploadsDir}`);
app.use('/uploads', express.static(uploadsDir));

// Set up logs directory
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

// Simple error handler
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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
      heartbeatFrequencyMS: 5000,
      retryWrites: true,
      w: 'majority'
    };

    const MONGODB_URI = "mongodb+srv://bhargaviajaypatel:bhargavi@cluster0.p7q0r.mongodb.net/careerconnectadmin?retryWrites=true&w=majority&appName=Cluster0";
    console.log(`[DB] Attempting connection to MongoDB with options: ${JSON.stringify(mongoOptions)}`);
    
    await mongoose.connect(MONGODB_URI, mongoOptions);
    
    console.log('[DB] Mongoose connect call completed.');

    if (mongoose.connection.readyState === 1) {
      console.log('[DB] MongoDB connected successfully!');
    } else {
      console.error('[DB] Mongoose connected, but readyState is not 1. State:', mongoose.connection.readyState);
      throw new Error('MongoDB connection failed post-connect call.');
    }

    // Add listeners for connection events
    mongoose.connection.on('error', (err) => {
      console.error('[DB Event] MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.log('[DB Event] MongoDB disconnected.');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('[DB Event] MongoDB reconnected.');
    });

    // Start the Express server
    const PORT = process.env.SERVER_PORT || 4000;
    app.listen(PORT, () => {
      console.log(`[Server] Express server listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('\n[Error] Server initialization:', error);
    process.exit(1);
  }
})();

export default app;
