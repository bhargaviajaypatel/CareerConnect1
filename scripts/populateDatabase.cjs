const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/server-side/models/user');
const Company = require('../src/server-side/models/Company');
const Roadmap = require('../src/server-side/models/Roadmap');
const Document = require('../src/server-side/models/Document');
const Experience = require('../src/server-side/models/Experience');
const Statistics = require('../src/server-side/models/Statistics');
const Announcement = require('../src/models/Announcement');
const PlacementStatistic = require('../src/models/PlacementStatistic');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample data
const sampleCompanies = [
  {
    name: 'Google',
    description: 'A multinational technology company specializing in Internet-related services and products.',
    website: 'https://www.google.com',
    logo: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
    hiringStatus: 'Active',
    jobOpenings: [
      {
        title: 'Software Engineer',
        description: 'Full-stack development position',
        requirements: ['JavaScript', 'React', 'Node.js'],
        salary: '120000-150000'
      }
    ]
  },
  {
    name: 'Microsoft',
    description: 'A multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software.',
    website: 'https://www.microsoft.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    hiringStatus: 'Active',
    jobOpenings: [
      {
        title: 'Cloud Solutions Architect',
        description: 'Azure cloud architecture position',
        requirements: ['Azure', 'Cloud Architecture', 'DevOps'],
        salary: '130000-160000'
      }
    ]
  }
];

const sampleRoadmaps = [
  {
    title: 'Full Stack Developer Roadmap',
    description: 'Comprehensive guide to becoming a full stack developer',
    steps: [
      {
        title: 'Learn HTML & CSS',
        description: 'Master the basics of web development',
        resources: ['MDN Web Docs', 'W3Schools']
      },
      {
        title: 'Learn JavaScript',
        description: 'Master JavaScript fundamentals',
        resources: ['JavaScript.info', 'Eloquent JavaScript']
      }
    ],
    category: 'Web Development'
  },
  {
    title: 'Data Science Roadmap',
    description: 'Path to becoming a data scientist',
    steps: [
      {
        title: 'Learn Python',
        description: 'Master Python programming',
        resources: ['Python.org', 'Real Python']
      },
      {
        title: 'Learn Statistics',
        description: 'Understand statistical concepts',
        resources: ['Statistics for Data Science', 'Khan Academy']
      }
    ],
    category: 'Data Science'
  }
];

const sampleDocuments = [
  {
    title: 'Resume Template',
    description: 'Professional resume template',
    category: 'Resume',
    fileUrl: '/uploads/resume-template.pdf',
    tags: ['resume', 'template', 'professional']
  },
  {
    title: 'Interview Preparation Guide',
    description: 'Comprehensive guide for technical interviews',
    category: 'Interview',
    fileUrl: '/uploads/interview-guide.pdf',
    tags: ['interview', 'preparation', 'technical']
  }
];

const sampleExperiences = [
  {
    title: 'Software Engineering Intern',
    company: 'Tech Corp',
    description: 'Worked on full-stack development projects',
    startDate: new Date('2022-06-01'),
    endDate: new Date('2022-08-31'),
    skills: ['JavaScript', 'React', 'Node.js']
  }
];

const sampleStatistics = [
  {
    year: 2023,
    totalPlacements: 150,
    averagePackage: 120000,
    highestPackage: 250000,
    companiesVisited: 25
  }
];

const sampleAnnouncements = [
  {
    title: 'Campus Recruitment Drive',
    description: 'Google is coming for campus recruitment next week',
    date: new Date('2023-12-01'),
    category: 'Recruitment'
  }
];

const samplePlacementStatistics = [
  {
    year: 2023,
    department: 'Computer Science',
    totalStudents: 100,
    placedStudents: 85,
    averagePackage: 120000
  }
];

// Create sample users (one admin and one regular user)
const createUsers = async () => {
  const adminUser = new User({
    username: 'admin',
    email: 'admin@careerconnect.com',
    password: 'Admin@123', // This will be hashed by the pre-save middleware
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '1234567890'
    }
  });

  const regularUser = new User({
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: 'User@123', // This will be hashed by the pre-save middleware
    role: 'user',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210'
    }
  });

  try {
    await adminUser.save();
    await regularUser.save();
    console.log('Users created successfully');
    console.log('Admin credentials:');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('\nRegular user credentials:');
    console.log('Username: john_doe');
    console.log('Password: User@123');
  } catch (error) {
    console.error('Error creating users:', error);
  }
};

// Populate all collections
const populateDatabase = async () => {
  try {
    // Clear existing data
    await Promise.all([
      Company.deleteMany({}),
      Roadmap.deleteMany({}),
      Document.deleteMany({}),
      Experience.deleteMany({}),
      Statistics.deleteMany({}),
      Announcement.deleteMany({}),
      PlacementStatistic.deleteMany({})
    ]);

    // Insert new data
    await Promise.all([
      Company.insertMany(sampleCompanies),
      Roadmap.insertMany(sampleRoadmaps),
      Document.insertMany(sampleDocuments),
      Experience.insertMany(sampleExperiences),
      Statistics.insertMany(sampleStatistics),
      Announcement.insertMany(sampleAnnouncements),
      PlacementStatistic.insertMany(samplePlacementStatistics)
    ]);

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the population script
createUsers()
  .then(() => populateDatabase())
  .catch(error => {
    console.error('Error:', error);
    mongoose.connection.close();
  }); 