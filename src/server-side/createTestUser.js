import mongoose from 'mongoose';
import { User } from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB with correct database name
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect', {});
    console.log('MongoDB connected');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create test user with all required fields
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password', // No hashing in our insecure version
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
    
    // Create admin user with all required fields
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // No hashing in our insecure version
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
    
    // Save test users
    await testUser.save();
    await adminUser.save();
    
    console.log('Test users created successfully');
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

connectDB(); 