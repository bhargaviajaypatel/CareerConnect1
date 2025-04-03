import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/user.js';
import { Company } from './models/Company.js';

// Initialize dotenv
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  addInterviews();
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addInterviews = async () => {
  try {
    // Find the special user
    const specialUser = await User.findOne({ email: 'student@careerconnect.com' });
    
    if (!specialUser) {
      console.error('Special user not found');
      process.exit(1);
    }
    
    console.log('Found special user:', specialUser.name);
    console.log('User ID:', specialUser._id);
    
    // Get companies
    const companies = await Company.find({}).limit(5);
    
    if (companies.length === 0) {
      console.error('No companies found');
      process.exit(1);
    }
    
    console.log(`Found ${companies.length} companies`);
    
    // Create dates for interviews
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
    
    const interviewData = [
      {
        companyName: companies[0].companyname, // Google
        interviewDate: addDays(today, 2),
        companyId: companies[0]._id
      },
      {
        companyName: companies[1].companyname, // Microsoft
        interviewDate: today,
        companyId: companies[1]._id
      },
      {
        companyName: companies[2].companyname, // Amazon
        interviewDate: addDays(today, 7),
        companyId: companies[2]._id
      },
      {
        companyName: companies[3].companyname, // Apple
        interviewDate: addDays(today, -3),
        companyId: companies[3]._id
      },
      {
        companyName: companies[4].companyname, // Meta
        interviewDate: addDays(today, 14),
        companyId: companies[4]._id
      }
    ];
    
    console.log('Interview dates created:');
    interviewData.forEach((interview, i) => {
      console.log(`${i+1}. ${interview.companyName}: ${interview.interviewDate.toLocaleString()}`);
    });
    
    // First, ensure schema has the field by checking another user
    try {
      // Try to find another user to check schema
      const anyUser = await User.findOne({ _id: { $ne: specialUser._id } });
      if (anyUser && !anyUser.scheduledInterviews) {
        console.log('Adding scheduledInterviews field to schema for all users...');
        await User.updateMany({}, { $set: { scheduledInterviews: [] } });
      }
    } catch (err) {
      console.log('Error checking other users:', err);
    }
    
    // Direct update method
    console.log('Directly updating user document with interviews...');
    const updateResult = await User.updateOne(
      { _id: specialUser._id },
      { 
        $set: { scheduledInterviews: interviewData },
        $addToSet: { appliedCompanies: { $each: interviewData.map(i => i.companyId) } }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Verify the update
    const verifyUser = await User.findById(specialUser._id);
    if (verifyUser && verifyUser.scheduledInterviews && verifyUser.scheduledInterviews.length > 0) {
      console.log(`Verified: User now has ${verifyUser.scheduledInterviews.length} interviews`);
      verifyUser.scheduledInterviews.forEach((interview, i) => {
        console.log(`${i+1}. ${interview.companyName}: ${new Date(interview.interviewDate).toLocaleString()}`);
      });
    } else {
      console.error('Failed to verify interviews were added!');
    }
    
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}; 