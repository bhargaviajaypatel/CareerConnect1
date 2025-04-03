import mongoose from 'mongoose';
import { User } from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect');
    console.log('MongoDB connected');
    
    // Find our special user
    const specialUser = await User.findOne({ email: 'student@careerconnect.com' });
    
    if (specialUser) {
      console.log('Special user found!');
      console.log(`Email: ${specialUser.email}`);
      console.log(`Password: ${specialUser.password}`);
      console.log(`Name: ${specialUser.name}`);
      console.log(`Role: ${specialUser.isAdmin ? 'Admin' : 'Student'}`);
      console.log(`Skills: ${specialUser.skills}`);
    } else {
      console.log('Special user not found.');
    }
    
    // Show total count of users
    const totalUsers = await User.countDocuments();
    console.log(`\nTotal users in database: ${totalUsers}`);
    
    // Show statistics
    const placedStudents = await User.countDocuments({ placementStatus: 'Placed' });
    const unplacedStudents = await User.countDocuments({ placementStatus: 'Not Placed' });
    const interviewScheduled = await User.countDocuments({ placementStatus: 'Interview Scheduled' });
    
    console.log('\nStudent Statistics:');
    console.log(`Total Students: ${await User.countDocuments({ isAdmin: false })}`);
    console.log(`Placed Students: ${placedStudents}`);
    console.log(`Unplaced Students: ${unplacedStudents}`);
    console.log(`Interview Scheduled: ${interviewScheduled}`);
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the function
checkUser(); 