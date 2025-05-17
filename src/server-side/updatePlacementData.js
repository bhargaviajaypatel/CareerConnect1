import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/user.js';

// Initialize dotenv
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerconnect')
  .then(() => {
    console.log('Connected to MongoDB for updating placement data');
    updatePlacementData();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// List of positions for placed users
const positions = [
  'Software Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'ML Engineer',
  'Product Manager',
  'QA Engineer',
  'Technical Support Engineer'
];

// List of locations
const locations = [
  'Bangalore',
  'Pune',
  'Mumbai',
  'Hyderabad',
  'Chennai',
  'Gurgaon',
  'Noida',
  'Delhi',
  'Kolkata',
  'Remote'
];

// Function to get a random item from an array
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Function to get a random number between min and max
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Main function to update placement data
const updatePlacementData = async () => {
  try {
    // Find all placed users
    const placedUsers = await User.find({ placementStatus: 'Placed' });
    
    console.log(`Found ${placedUsers.length} placed users to update`);
    
    let updatedCount = 0;
    
    for (const user of placedUsers) {
      // Skip users that already have complete placement data
      if (user.package && user.position && user.location) {
        console.log(`User ${user.name} already has complete placement data`);
        continue;
      }
      
      // Generate random package between 8 and 30 LPA
      const salaryPackage = getRandomNumber(8, 30);
      
      // Get random position and location
      const position = getRandomItem(positions);
      const location = getRandomItem(locations);
      
      // Update user with placement details
      user.package = salaryPackage;
      user.position = position;
      user.location = location;
      
      await user.save();
      updatedCount++;
      
      console.log(`Updated user ${user.name} with placement details:
        - Company: ${user.companyPlaced}
        - Package: ${salaryPackage} LPA
        - Position: ${position}
        - Location: ${location}
      `);
    }
    
    console.log(`Updated placement details for ${updatedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating placement data:', error);
    process.exit(1);
  }
}; 