import mongoose from 'mongoose';
import { User } from './models/user.js';
import { Company } from './models/Company.js';
import { Interview } from './models/Experience.js';
import dotenv from 'dotenv';

dotenv.config();

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

const branches = [
  'BTECH-CS', 'BTECH-IT', 'BTECH-DATA SCIENCE', 'MCA', 'BTECH-ELECTRONICS'
];

const experienceTemplates = [
  "The interview process was thorough and focused on both technical and behavioral aspects. The technical round included coding questions on {{skill}} and {{skill}}.",
  "I had a great experience interviewing with {{companyName}}. The interviewers were friendly and asked challenging questions about {{skill}} and {{skill}}.",
  "The interview at {{companyName}} consisted of multiple rounds. They tested my knowledge of {{skill}} extensively and asked some system design questions.",
  "{{companyName}}'s interview was challenging but fair. They wanted to see practical coding skills in {{skill}} and problem-solving abilities.",
  "The process at {{companyName}} involved a coding test, technical interviews, and a cultural fit assessment. The technical questions focused on {{skill}} and data structures."
];

// Generate sample companies
const generateSampleCompanies = (count) => {
  const companies = [];
  for (let i = 0; i < count; i++) {
    const companyName = companyNames[i % companyNames.length]; // Ensure unique companies until we run out
    const requiredSkillsArray = getRandomElements(skills, getRandomNumber(3, 6));
    const jobProfile = getRandomElement(roles);
    
    companies.push({
      companyname: companyName,
      jobprofile: jobProfile,
      jobdescription: `${companyName} is looking for talented ${jobProfile}s to join our team. This is an exciting opportunity to work with cutting-edge technologies and make a significant impact.`,
      website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      ctc: getRandomNumber(8, 40),
      doi: getRandomDate(new Date(2023, 8, 1), new Date(2024, 3, 30)),
      eligibilityCriteria: getRandomElements(branches, getRandomNumber(1, branches.length)),
      tenthPercentage: getRandomNumber(60, 80),
      twelfthPercentage: getRandomNumber(60, 80),
      graduationCGPA: getRandomFloat(6.5, 8.5, 1),
      sixthSemesterCGPA: getRandomFloat(6.5, 8.5, 1),
      requiredSkills: requiredSkillsArray,
      rolesAndResponsibilities: [
        `Design and develop ${jobProfile} solutions`,
        `Work with ${getRandomElements(requiredSkillsArray, 2).join(' and ')}`,
        'Collaborate with cross-functional teams',
        'Solve complex technical challenges',
        'Participate in code reviews and technical discussions'
      ]
    });
  }
  return companies;
};

// Generate interview experiences
const generateInterviewExperiences = (users, companies) => {
  const experiences = [];
  
  // Select a subset of users to have interview experiences
  const usersWithExperiences = getRandomElements(users, Math.floor(users.length * 0.6));
  
  for (const user of usersWithExperiences) {
    // Select 1-3 companies per user for interview experiences
    const interviewCompanies = getRandomElements(companies, getRandomNumber(1, 3));
    
    for (const company of interviewCompanies) {
      const template = getRandomElement(experienceTemplates);
      const interviewSkills = getRandomElements(company.requiredSkills, 2);
      
      // Replace placeholders in the template
      const experience = template
        .replace('{{companyName}}', company.companyname)
        .replace(/{{skill}}/g, (_, i) => interviewSkills[i % interviewSkills.length]);
      
      // Determine result - slightly biased towards success for placed users
      let result = getRandomElement(['Selected', 'Rejected', 'On Hold', 'Waiting for Results']);
      
      // If user is placed at this company, they should have been selected
      if (user.placementStatus === 'Placed' && user.companyPlaced === company.companyname) {
        result = 'Selected';
      }
      
      experiences.push({
        username: user.name,
        userId: user._id, // Store user reference
        companyName: company.companyname,
        companyId: company._id, // Store company reference
        position: company.jobprofile,
        experience: experience,
        interviewLevel: getRandomElement(['Easy', 'Medium', 'Hard']),
        result: result
      });
    }
  }
  
  return experiences;
};

// Main function to add sample companies and connect them with users
const addSampleCompaniesAndExperiences = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect');
    console.log('MongoDB connected');
    
    // Get existing users
    const users = await User.find({ isAdmin: false });
    console.log(`Found ${users.length} users in the database`);
    
    if (users.length === 0) {
      console.log("No users found. Please run addSampleUsers.js first.");
      return;
    }
    
    // Clear existing companies and interviews
    await Company.deleteMany({});
    await Interview.deleteMany({});
    console.log("Cleared existing companies and interview experiences");
    
    // Generate 15-20 companies
    const numberOfCompanies = getRandomNumber(15, 20);
    const sampleCompanies = generateSampleCompanies(numberOfCompanies);
    
    // Insert companies
    const insertedCompanies = await Company.insertMany(sampleCompanies);
    console.log(`${insertedCompanies.length} companies added to the database`);
    
    // Generate interview experiences
    const interviewExperiences = generateInterviewExperiences(users, insertedCompanies);
    await Interview.insertMany(interviewExperiences);
    console.log(`${interviewExperiences.length} interview experiences added`);
    
    // Update users with applied companies and placement status
    let placedCount = 0;
    let appliedCount = 0;
    
    for (const user of users) {
      // Randomly select companies for this user to apply to (2-5 companies)
      const appliedCompanyIds = getRandomElements(insertedCompanies, getRandomNumber(2, 5)).map(company => company._id);
      user.appliedCompanies = appliedCompanyIds;
      appliedCount++;
      
      // For placed users, set the company they were placed at
      if (user.placementStatus === 'Placed') {
        const placedCompany = getRandomElement(insertedCompanies);
        user.companyPlaced = placedCompany.companyname;
        placedCount++;
      }
      
      // For users with interview scheduled, make sure they have applied companies
      if (user.placementStatus === 'Interview Scheduled' && user.appliedCompanies.length === 0) {
        const scheduledCompanyIds = getRandomElements(insertedCompanies, getRandomNumber(1, 3)).map(company => company._id);
        user.appliedCompanies = scheduledCompanyIds;
      }
      
      await user.save();
    }
    
    console.log(`${appliedCount} users updated with applied companies`);
    console.log(`${placedCount} users marked as placed at specific companies`);
    
    // Generate statistics
    const totalStudents = await User.countDocuments({ isAdmin: false });
    const placedStudents = await User.countDocuments({ placementStatus: 'Placed' });
    const unplacedStudents = await User.countDocuments({ placementStatus: 'Not Placed' });
    const interviewScheduled = await User.countDocuments({ placementStatus: 'Interview Scheduled' });
    
    // Count applications per company
    const applicationStats = [];
    for (const company of insertedCompanies) {
      const applicantCount = await User.countDocuments({ appliedCompanies: company._id });
      applicationStats.push({
        companyName: company.companyname,
        applicants: applicantCount,
        package: company.ctc
      });
    }
    
    applicationStats.sort((a, b) => b.applicants - a.applicants);
    
    // Print statistics
    console.log('\n===== PLACEMENT STATISTICS =====');
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Placed Students: ${placedStudents} (${Math.round(placedStudents/totalStudents*100)}%)`);
    console.log(`Unplaced Students: ${unplacedStudents}`);
    console.log(`Interview Scheduled: ${interviewScheduled}`);
    
    console.log('\n===== TOP COMPANIES BY APPLICATIONS =====');
    applicationStats.slice(0, 5).forEach((stat, index) => {
      console.log(`${index+1}. ${stat.companyName} - ${stat.applicants} applicants (Package: ${stat.package} LPA)`);
    });
    
    console.log('\n===== INTERVIEW STATISTICS =====');
    const totalInterviews = await Interview.countDocuments();
    const easyInterviews = await Interview.countDocuments({ interviewLevel: 'Easy' });
    const mediumInterviews = await Interview.countDocuments({ interviewLevel: 'Medium' });
    const hardInterviews = await Interview.countDocuments({ interviewLevel: 'Hard' });
    const selectedInterviews = await Interview.countDocuments({ result: 'Selected' });
    
    console.log(`Total Interviews: ${totalInterviews}`);
    console.log(`Selected: ${selectedInterviews} (${Math.round(selectedInterviews/totalInterviews*100)}%)`);
    console.log(`Easy: ${easyInterviews}, Medium: ${mediumInterviews}, Hard: ${hardInterviews}`);
    
    console.log('\nSample companies and experiences added successfully!');
  } catch (error) {
    console.error('Error adding sample companies:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the function
addSampleCompaniesAndExperiences(); 