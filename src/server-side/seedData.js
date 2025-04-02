import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';
import { Company } from './models/Company.js';
import { Interview } from './models/Experience.js';

dotenv.config();

// Connection to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect', {
  authSource: 'admin',
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully for seeding data');
  seedData();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Array of Indian universities and colleges
const universities = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur',
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
  'BITS Pilani', 'BITS Goa', 'BITS Hyderabad',
  'Delhi University', 'Mumbai University', 'Pune University',
  'VIT Vellore', 'SRM Chennai', 'Amity University',
  'Manipal Institute of Technology', 'VJTI Mumbai',
  'College of Engineering, Pune', 'PSG College of Technology'
];

// Array of Indian names
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

// Array of roles
const roles = [
  'Software Developer', 'Web Developer', 'Mobile App Developer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Architect', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'QA Engineer', 'System Administrator',
  'UI/UX Designer', 'Product Manager', 'Project Manager',
  'Business Analyst', 'Database Administrator', 'Network Engineer',
  'Security Engineer', 'Data Analyst'
];

// Array of Indian company names
const companyNames = [
  'Tata Consultancy Services', 'Infosys', 'Wipro',
  'HCL Technologies', 'Tech Mahindra', 'Cognizant',
  'IBM India', 'Accenture India', 'Capgemini India',
  'Reliance Digital', 'Flipkart', 'Amazon India',
  'Microsoft India', 'Google India', 'Adobe India',
  'Oracle India', 'SAP India', 'Cisco India',
  'Zomato', 'Swiggy', 'OYO', 'BYJU\'S',
  'Paytm', 'MakeMyTrip', 'PolicyBazaar'
];

// Skills array
const skills = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js',
  'Django', 'Flask', 'Spring Boot', 'Ruby on Rails',
  'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'Git', 'Jenkins', 'Linux', 'Bash', 'PowerShell',
  'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind CSS',
  'TypeScript', 'GraphQL', 'REST API', 'Redux', 'MobX',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Data Analysis', 'Big Data', 'Hadoop', 'Spark', 'TensorFlow'
];

// Utility functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Generate fake users
const generateFakeUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomNumber(1, 999)}@example.com`;
    
    users.push({
      name: `${firstName} ${lastName}`,
      email: email,
      password: 'password123', // Simple password for all test users
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

// Generate fake companies
const generateFakeCompanies = (count) => {
  const companies = [];
  for (let i = 0; i < count; i++) {
    const name = companyNames[i % companyNames.length]; // Ensure we use unique names by cycling through the list
    const requiredSkillsArray = getRandomElements(skills, getRandomNumber(3, 8));
    const rolesArray = getRandomElements(
      [
        'Develop scalable web applications',
        'Build responsive user interfaces',
        'Optimize database queries',
        'Implement security best practices',
        'Deploy applications to cloud environments',
        'Create and maintain APIs',
        'Write automated tests',
        'Debug and fix software issues',
        'Collaborate with cross-functional teams',
        'Participate in code reviews',
        'Document code and architecture',
        'Analyze and improve application performance',
        'Stay updated with industry trends',
        'Mentor junior developers',
        'Research and implement new technologies'
      ],
      getRandomNumber(3, 7)
    );
    
    companies.push({
      companyname: name,
      jobprofile: getRandomElement(roles),
      jobdescription: `${name} is looking for talented individuals to join our team as ${getRandomElement(roles)}. This is an excellent opportunity to work with cutting-edge technologies and solve challenging problems.`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
      ctc: getRandomNumber(5, 30),
      doi: getRandomDate(new Date(2023, 8, 1), new Date(2023, 11, 31)),
      eligibilityCriteria: getRandomElements(['MCA', 'BTECH-IT', 'BTECH-CS', 'BTECH-CYBERSECURITY', 'BTECH-DATA SCIENCE'], getRandomNumber(1, 5)),
      tenthPercentage: getRandomNumber(60, 80),
      twelfthPercentage: getRandomNumber(60, 80),
      graduationCGPA: getRandomFloat(6.5, 8.5, 1),
      sixthSemesterCGPA: getRandomFloat(6.5, 8.5, 1),
      requiredSkills: requiredSkillsArray,
      rolesAndResponsibilities: rolesArray
    });
  }
  return companies;
};

// Generate fake interview experiences
const generateFakeInterviewExperiences = (userCount, companyCount) => {
  const experiences = [];
  for (let i = 0; i < userCount; i++) {
    if (Math.random() > 0.5) { // Only generate for some users
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const username = `${firstName} ${lastName}`;
      const companyName = companyNames[Math.floor(Math.random() * companyCount)];
      
      experiences.push({
        username: username,
        companyName: companyName,
        position: getRandomElement(roles),
        experience: `The interview at ${companyName} was ${getRandomElement(['great', 'challenging', 'insightful', 'tough', 'interesting'])}. ${getRandomElement([
          'They asked questions about data structures and algorithms.',
          'They focused on system design principles.',
          'The technical round included practical coding problems.',
          'I had to solve a few real-world coding challenges.',
          'The interview process was thorough and well-structured.',
          'They tested my problem-solving skills through various scenarios.',
          'The interviewers were friendly and made me feel comfortable.',
          'The HR round focused on behavioral questions.',
          'I had to explain my past projects in detail.',
          'There was a group discussion round as well.'
        ])}`,
        interviewLevel: getRandomElement(['Easy', 'Medium', 'Hard']),
        result: getRandomElement(['Selected', 'Rejected', 'On Hold', 'Waiting for Results'])
      });
    }
  }
  return experiences;
};

// Main function to seed the database
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({ email: { $ne: 'admin@example.com' } }); // Don't delete the admin user
    await Company.deleteMany({});
    await Interview.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Generate fake data
    const userCount = 30;
    const companyCount = 10;
    
    const fakeUsers = generateFakeUsers(userCount);
    const fakeCompanies = generateFakeCompanies(companyCount);
    const fakeInterviews = generateFakeInterviewExperiences(userCount, companyCount);
    
    // Insert fake users
    await User.insertMany(fakeUsers);
    console.log(`${userCount} fake users inserted`);
    
    // Insert fake companies
    const insertedCompanies = await Company.insertMany(fakeCompanies);
    console.log(`${companyCount} fake companies inserted`);
    
    // Insert fake interview experiences
    await Interview.insertMany(fakeInterviews);
    console.log(`${fakeInterviews.length} fake interview experiences inserted`);
    
    // Update users with applied companies
    const users = await User.find({ email: { $ne: 'admin@example.com' } });
    const companyIds = insertedCompanies.map(company => company._id);
    
    for (const user of users) {
      // Randomly select 1-5 companies for each user to apply to
      const appliedCompanyIds = getRandomElements(companyIds, getRandomNumber(1, 5));
      user.appliedCompanies = appliedCompanyIds;
      
      // Randomly set company placed for some users
      if (user.placementStatus === 'Placed') {
        const randomCompany = getRandomElement(insertedCompanies);
        user.companyPlaced = randomCompany.companyname;
      }
      
      await user.save();
    }
    console.log('Users updated with applied companies');
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}; 