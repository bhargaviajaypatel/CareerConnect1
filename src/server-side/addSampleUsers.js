import mongoose from 'mongoose';
import { User } from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

// Update MongoDB URI to use correct case
const MONGODB_URI = process.env.MONGODB_URI.replace('CareerConnect', 'careerconnect');

// Utility functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Arrays for generating sample data
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun',
  'Reyansh', 'Ayaan', 'Ananya', 'Diya', 'Advik',
  'Rudra', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv',
  'Advait', 'Dhruv', 'Kabir', 'Ritvik', 'Aadhya',
  'Avni', 'Ishanvi', 'Anika', 'Tanvi', 'Aanya',
  'Saanvi', 'Ira', 'Ahana', 'Disha', 'Nisha',
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram',
  'Neha', 'Rajesh', 'Pooja', 'Sanjay', 'Riya'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh',
  'Kumar', 'Joshi', 'Shah', 'Mehta', 'Chauhan',
  'Agarwal', 'Malhotra', 'Kapoor', 'Yadav', 'Reddy',
  'Jain', 'Desai', 'Nair', 'Menon', 'Iyer',
  'Chakraborty', 'Banerjee', 'Mukherjee', 'Das', 'Sen',
  'Pillai', 'Rao', 'Patil', 'Gowda', 'Kulkarni'
];

const skills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java',
  'C++', 'C#', 'PHP', 'Ruby', 'Swift',
  'Kotlin', 'Go', 'Rust', 'TypeScript', 'Angular',
  'Vue.js', 'HTML/CSS', 'jQuery', 'Bootstrap', 'Tailwind CSS',
  'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'AWS',
  'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'GraphQL',
  'REST API', 'Machine Learning', 'Data Analysis', 'Tensorflow', 'PyTorch',
  'React Native', 'Flutter', 'iOS Development', 'Android Development', 'DevOps'
];

const universities = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur',
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
  'BITS Pilani', 'BITS Goa', 'BITS Hyderabad',
  'Delhi University', 'Mumbai University', 'Pune University',
  'VIT Vellore', 'SRM Chennai', 'Amity University',
  'Manipal Institute of Technology', 'VJTI Mumbai',
  'College of Engineering, Pune', 'PSG College of Technology'
];

const roles = [
  'Software Developer', 'Web Developer', 'Mobile App Developer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Architect', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'QA Engineer', 'System Administrator',
  'UI/UX Designer', 'Product Manager', 'Project Manager',
  'Business Analyst', 'Database Administrator', 'Network Engineer',
  'Security Engineer', 'Data Analyst'
];

const companyNames = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
  'Netflix', 'Tesla', 'IBM', 'Intel', 'Oracle',
  'Salesforce', 'Adobe', 'Cisco', 'Dell', 'HP',
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant',
  'Accenture', 'Capgemini', 'Deloitte', 'PwC', 'EY',
  'KPMG', 'JPMorgan Chase', 'Goldman Sachs', 'Morgan Stanley', 'Barclays'
];

// Generate sample users
const generateSampleUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomNumber(1, 999)}@example.com`;
    
    // Special user with known credentials (returning the first one generated)
    const isSpecialUser = i === 0;
    const specialEmail = isSpecialUser ? 'student@careerconnect.com' : email;
    const specialPassword = isSpecialUser ? 'student123' : 'password123';
    
    users.push({
      name: `${firstName} ${lastName}`,
      email: specialEmail,
      password: specialPassword, // Simple password for all test users
      contactNumber: `9${getRandomNumber(100000000, 999999999)}`,
      sapId: `SAP${getRandomNumber(10000, 99999)}`,
      rollNo: `R${getRandomNumber(1000, 9999)}`,
      gender: getRandomElement(['Male', 'Female', 'Other']),
      dob: getRandomDate(new Date(1995, 0, 1), new Date(2002, 11, 31)),
      tenthPercentage: getRandomFloat(60, 95),
      tenthSchool: `${getRandomElement(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'])} Public School`,
      twelfthPercentage: getRandomFloat(60, 95),
      twelfthCollege: `${getRandomElement(['St.', 'Holy', 'Modern', 'National', 'Central', 'City'])} ${getRandomElement(['College', 'Institute', 'Academy'])}`,
      graduationCollege: getRandomElement(universities),
      graduationCGPA: getRandomFloat(7, 10, 1),
      stream: getRandomElement(['Computer Engineering', 'IT', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical']),
      sixthSemesterCGPA: getRandomFloat(7, 10, 1),
      isAdmin: false,
      skills: getRandomElements(skills, getRandomNumber(3, 8)).join(', '),
      projects: `Project ${getRandomNumber(1, 5)}`,
      careerPreferences: {
        interestedCompanies: getRandomElements(companyNames, getRandomNumber(2, 5)),
        interestedRoles: getRandomElements(roles, getRandomNumber(2, 4)),
        interestedSkills: getRandomElements(skills, getRandomNumber(3, 7)),
        careerGoals: getRandomElement([
          'To become a full-stack developer',
          'To work with cutting-edge technologies',
          'To lead a development team',
          'To be a data scientist',
          'To work on AI and ML projects',
          'To become a cloud architect',
          'To work on innovative products',
          'To start my own tech company'
        ])
      },
      placementStatus: getRandomElement(['Not Placed', 'Placed', 'Interview Scheduled']),
      appliedCompanies: []
    });
  }
  return users;
};

// Main function to add sample users
const addSampleUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/CareerConnect');
    console.log('MongoDB connected');
    
    // Check if users already exist
    const userCount = await User.countDocuments();
    console.log(`Current user count in database: ${userCount}`);
    
    // Generate between 30-40 users
    const numberOfUsers = getRandomNumber(30, 40);
    const sampleUsers = generateSampleUsers(numberOfUsers);
    
    // Insert sample users
    let insertedCount = 0;
    
    for (const user of sampleUsers) {
      const existingUser = await User.findOne({ email: user.email });
      
      if (!existingUser) {
        await User.create(user);
        insertedCount++;
      }
    }
    
    console.log(`${insertedCount} new sample users added to the database`);
    console.log(`Special user credentials - Email: student@careerconnect.com, Password: student123`);
    
    // Update student statistics
    const placedStudents = await User.countDocuments({ placementStatus: 'Placed' });
    const unplacedStudents = await User.countDocuments({ placementStatus: 'Not Placed' });
    const interviewScheduled = await User.countDocuments({ placementStatus: 'Interview Scheduled' });
    
    console.log('\nStudent Statistics:');
    console.log(`Total Students: ${await User.countDocuments({ isAdmin: false })}`);
    console.log(`Placed Students: ${placedStudents}`);
    console.log(`Unplaced Students: ${unplacedStudents}`);
    console.log(`Interview Scheduled: ${interviewScheduled}`);
    
    console.log('\nSample users added successfully!');
  } catch (error) {
    console.error('Error adding sample users:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the function
addSampleUsers(); 