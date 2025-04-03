import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/user.js';
import { Company } from './models/Company.js';

// Initialize dotenv
dotenv.config();

// Add scheduledInterviews field to User model if it's missing
const userSchema = User.schema;
if (!userSchema.path('scheduledInterviews')) {
  userSchema.add({
    scheduledInterviews: [{
      companyName: { type: String, required: true },
      interviewDate: { type: Date, required: true },
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }
    }]
  });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB for adding sample interviews');
  addSampleInterviews();
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

// Function to add sample interviews
const addSampleInterviews = async () => {
  try {
    // Find the special user
    const specialUser = await User.findOne({ email: 'student@careerconnect.com' });
    
    if (!specialUser) {
      console.error('Special user not found. Please make sure the user exists in the database.');
      process.exit(1);
    }
    
    console.log(`Found special user: ${specialUser.name}`);
    
    // Get available companies
    const companies = await Company.find({}).limit(5);
    
    if (companies.length === 0) {
      console.error('No companies found. Please add companies first.');
      process.exit(1);
    }
    
    console.log(`Found ${companies.length} companies for interviews`);
    
    // Create sample interview dates with explicit current year
    const currentYear = new Date().getFullYear();
    console.log("Current year to use:", currentYear);
    
    // Calculate today's date
    const now = new Date();
    console.log("Current date:", now.toLocaleString());
    
    // Create dates for interviews - with the current year
    const todayDate = new Date();
    todayDate.setHours(14, 30, 0, 0); // Today at 2:30 PM
    
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    twoDaysLater.setHours(10, 0, 0, 0); // 10:00 AM
    
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    sevenDaysLater.setHours(15, 0, 0, 0); // 3:00 PM
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(11, 0, 0, 0); // 11:00 AM
    
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    fourteenDaysLater.setHours(13, 0, 0, 0); // 1:00 PM
    
    console.log("Sample dates created:", {
      today: todayDate.toLocaleString(),
      twoDaysLater: twoDaysLater.toLocaleString(),
      sevenDaysLater: sevenDaysLater.toLocaleString(),
      threeDaysAgo: threeDaysAgo.toLocaleString(),
      fourteenDaysLater: fourteenDaysLater.toLocaleString()
    });
    
    const sampleInterviews = [
      {
        companyName: companies[0].companyname, // Google
        interviewDate: twoDaysLater, // 2 days from now
        companyId: companies[0]._id
      },
      {
        companyName: companies[1].companyname, // Microsoft
        interviewDate: todayDate, // Today
        companyId: companies[1]._id
      },
      {
        companyName: companies[2].companyname, // Amazon
        interviewDate: sevenDaysLater, // 7 days from now
        companyId: companies[2]._id
      },
      {
        companyName: companies[3].companyname, // Apple
        interviewDate: threeDaysAgo, // 3 days ago (past interview)
        companyId: companies[3]._id
      },
      {
        companyName: companies[4].companyname, // Meta
        interviewDate: fourteenDaysLater, // 14 days from now
        companyId: companies[4]._id
      }
    ];
    
    // Check if user already has scheduledInterviews property
    if (!specialUser.scheduledInterviews) {
      specialUser.scheduledInterviews = [];
      console.log('Created scheduledInterviews array for user');
    } else if (specialUser.scheduledInterviews.length > 0) {
      console.log(`User already has ${specialUser.scheduledInterviews.length} interviews scheduled. Removing them first...`);
      specialUser.scheduledInterviews = [];
    }
    
    // Add the interviews to user
    specialUser.scheduledInterviews = sampleInterviews;
    
    // Add companies to appliedCompanies if not already there
    if (!specialUser.appliedCompanies) {
      specialUser.appliedCompanies = [];
    }
    
    const userAppliedCompanies = specialUser.appliedCompanies.map(company => company.toString());
    
    for (const interview of sampleInterviews) {
      const companyIdStr = interview.companyId.toString();
      if (!userAppliedCompanies.includes(companyIdStr)) {
        specialUser.appliedCompanies.push(interview.companyId);
      }
    }
    
    // Save the user
    try {
      console.log('Attempting to save user with interviews...');
      const result = await specialUser.save();
      console.log('Save operation result:', result ? 'Success' : 'Failed');
      
      // Verify save by re-fetching the user
      const verifyUser = await User.findById(specialUser._id);
      if (verifyUser && verifyUser.scheduledInterviews && verifyUser.scheduledInterviews.length > 0) {
        console.log(`Verified: User now has ${verifyUser.scheduledInterviews.length} interviews saved in database`);
      } else {
        console.log('Warning: Could not verify interviews were saved!');
      }
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      throw saveError;
    }
    
    console.log(`Successfully added ${sampleInterviews.length} sample interviews to user: ${specialUser.name}`);
    console.log('Sample interview dates:');
    sampleInterviews.forEach((interview, index) => {
      console.log(`${index + 1}. ${interview.companyName}: ${interview.interviewDate.toLocaleString()}`);
    });
    
    // Close connection
    mongoose.connection.close();
    console.log('Done! MongoDB connection closed.');
    
  } catch (error) {
    console.error('Error adding sample interviews:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}; 