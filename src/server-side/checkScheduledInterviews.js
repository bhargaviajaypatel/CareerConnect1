import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/user.js';

// Initialize dotenv
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  checkInterviews();
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

const checkInterviews = async () => {
  try {
    // Find the special user
    const specialUser = await User.findOne({ email: 'student@careerconnect.com' });
    
    if (!specialUser) {
      console.error('Special user not found');
      process.exit(1);
    }
    
    console.log('Found special user:', specialUser.name);
    console.log('User ID:', specialUser._id);
    
    // Check if the user has scheduled interviews
    if (!specialUser.scheduledInterviews || !Array.isArray(specialUser.scheduledInterviews)) {
      console.log('User has no scheduled interviews array');
      
      // Initialize if not exists
      specialUser.scheduledInterviews = [];
      await specialUser.save();
      console.log('Created empty scheduledInterviews array for user');
    } else if (specialUser.scheduledInterviews.length === 0) {
      console.log('User has an empty scheduledInterviews array');
    } else {
      console.log(`User has ${specialUser.scheduledInterviews.length} scheduled interviews:`);
      
      // Log details of each interview
      specialUser.scheduledInterviews.forEach((interview, index) => {
        const interviewDate = new Date(interview.interviewDate);
        console.log(`${index + 1}. Company: ${interview.companyName}`);
        console.log(`   Date: ${interviewDate.toLocaleDateString()} at ${interviewDate.toLocaleTimeString()}`);
        console.log(`   Company ID: ${interview.companyId}`);
        console.log(`   MongoDB _id: ${interview._id}`);
      });
    }
    
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error checking interviews:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}; 