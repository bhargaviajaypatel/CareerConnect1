import mongoose from 'mongoose';
import { Company } from './models/Company.js';
import dotenv from 'dotenv';

dotenv.config();

// Connection to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect', {
  authSource: 'admin',
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
  addSampleCompany();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to add a sample company
const addSampleCompany = async () => {
  try {
    // Create a sample company
    const sampleCompany = new Company({
      companyname: 'Google',
      jobprofile: 'Software Engineer',
      jobdescription: 'Google is looking for talented engineers to join our team.',
      website: 'https://www.google.com',
      ctc: 25,
      doi: new Date('2023-12-15'),
      eligibilityCriteria: ['BTECH-CS', 'BTECH-IT', 'MCA'],
      tenthPercentage: 70,
      twelfthPercentage: 70,
      graduationCGPA: 8.0,
      sixthSemesterCGPA: 7.5,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Data Structures', 'Algorithms'],
      rolesAndResponsibilities: [
        'Develop web applications',
        'Write clean and maintainable code',
        'Collaborate with team members',
        'Design efficient algorithms'
      ]
    });

    // Save the company to the database
    await sampleCompany.save();
    console.log('Sample company added successfully');

    // Add another sample company
    const sampleCompany2 = new Company({
      companyname: 'Microsoft',
      jobprofile: 'Full Stack Developer',
      jobdescription: 'Microsoft is seeking talented full stack developers to build innovative products.',
      website: 'https://www.microsoft.com',
      ctc: 20,
      doi: new Date('2023-11-30'),
      eligibilityCriteria: ['BTECH-CS', 'BTECH-IT', 'MCA'],
      tenthPercentage: 75,
      twelfthPercentage: 75,
      graduationCGPA: 7.5,
      sixthSemesterCGPA: 7.0,
      requiredSkills: ['C#', '.NET', 'Azure', 'React', 'SQL Server'],
      rolesAndResponsibilities: [
        'Develop scalable web applications',
        'Work with Azure cloud services',
        'Design and implement database solutions',
        'Work in an agile environment'
      ]
    });

    await sampleCompany2.save();
    console.log('Second sample company added successfully');

    // Exit the process after adding the companies
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample companies:', error);
    process.exit(1);
  }
}; 