import mongoose from 'mongoose';
import { User } from '../src/server-side/models/user.js';
import { Company } from '../src/server-side/models/Company.js';
import { Interview } from '../src/server-side/models/Experience.js';
import bcrypt from 'bcrypt';

const MONGODB_URI = "mongodb+srv://bhargaviajaypatel:bhargavi@cluster0.p7q0r.mongodb.net/careerconnect?retryWrites=true&w=majority&appName=Cluster0";

const createTestData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Interview.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create test user
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const testUser = await User.create({
      username: "testuser",
      email: "test@careerconnect.com",
      password: hashedPassword,
      role: 'user',
      contactNumber: "9876543210",
      sapId: "60004200123",
      rollNo: "TU001",
      gender: "Male",
      dob: "2000-01-01",
      tenthPercentage: 95,
      tenthSchool: "Delhi Public School",
      twelfthPercentage: 92,
      twelfthCollege: "Ryan International School",
      graduationCollege: "VJTI Mumbai",
      graduationCGPA: 9.2,
      stream: "Computer Engineering",
      sixthSemesterCGPA: 9.0,
      placementStatus: "Not Placed",
      skills: "JavaScript, React, Node.js, MongoDB, Python",
      projects: "E-commerce Platform, Social Media App, Weather App",
      internships: "Summer Intern at TechCorp (3 months)",
      achievements: "1st Prize in National Coding Competition",
      certifications: "AWS Certified Developer, MongoDB Developer",
      profile: {
        firstName: "Test",
        lastName: "User",
        phone: "9876543210",
        department: "Computer Engineering",
        graduationYear: 2024,
        skills: ["JavaScript", "React", "Node.js"]
      },
      socialLinks: {
        linkedin: "https://linkedin.com/in/testuser",
        github: "https://github.com/testuser",
        portfolio: "https://testuser.dev"
      }
    });
    console.log('Created test user');

    // Create companies
    const companies = await Company.create([
      {
        companyname: "Google",
        website: "https://google.com",
        ctc: 45,
        jobprofile: "Software Development Engineer",
        jobdescription: "As a Software Development Engineer at Google, you will work on complex systems and innovative technology. You'll collaborate with cross-functional teams to develop scalable solutions.",
        tenthPercentage: 80,
        twelfthPercentage: 80,
        graduationCGPA: 8.0,
        sixthSemesterCGPA: 8.0,
        doi: "2025-05-15",
        eligibilityCriteria: [
          "BTech/BE in Computer Science or related field",
          "No active backlogs",
          "Strong problem-solving skills"
        ],
        requiredSkills: ["Java", "Python", "DSA", "System Design"],
        rolesAndResponsibilities: [
          "Design and develop scalable software solutions",
          "Write clean, maintainable code",
          "Collaborate with cross-functional teams",
          "Participate in code reviews"
        ]
      },
      {
        companyname: "Microsoft",
        website: "https://microsoft.com",
        ctc: 44,
        jobprofile: "Software Engineer",
        jobdescription: "Join Microsoft as a Software Engineer to work on cutting-edge technologies. You'll be responsible for designing and implementing software solutions that power millions of users.",
        tenthPercentage: 80,
        twelfthPercentage: 80,
        graduationCGPA: 7.5,
        sixthSemesterCGPA: 7.5,
        doi: "2025-05-25",
        eligibilityCriteria: [
          "BTech/BE in Computer Science or related field",
          "No active backlogs",
          "Strong coding skills"
        ],
        requiredSkills: ["C++", "JavaScript", "Azure", "Web Development"],
        rolesAndResponsibilities: [
          "Develop new features for Microsoft products",
          "Debug and fix software issues",
          "Write technical documentation",
          "Work with product managers to define requirements"
        ]
      },
      {
        companyname: "Amazon",
        website: "https://amazon.com",
        ctc: 42,
        jobprofile: "SDE-1",
        jobdescription: "As an SDE-1 at Amazon, you'll be part of a team that's responsible for building scalable services. You'll work in an agile environment and contribute to the entire development lifecycle.",
        tenthPercentage: 75,
        twelfthPercentage: 75,
        graduationCGPA: 7.0,
        sixthSemesterCGPA: 7.0,
        doi: "2025-06-05",
        eligibilityCriteria: [
          "BTech/BE in Computer Science or related field",
          "No active backlogs",
          "Knowledge of data structures"
        ],
        requiredSkills: ["Java", "AWS", "Distributed Systems"],
        rolesAndResponsibilities: [
          "Design and implement scalable services",
          "Work in an agile environment",
          "Contribute to system architecture",
          "Participate in on-call rotations"
        ]
      }
    ]);
    console.log('Created sample companies');

    // Create interview experiences
    await Interview.create([
      {
        username: testUser.username,
        companyName: "Google",
        position: "Software Development Engineer",
        experience: "The interview process consisted of 3 rounds. First was a DSA round focusing on algorithms and problem-solving. Second round was system design where I had to design a URL shortener. Final round was behavioral.",
        interviewLevel: "On-Campus",
        result: "Selected"
      },
      {
        username: testUser.username,
        companyName: "Microsoft",
        position: "Software Engineer",
        experience: "Had 4 rounds of interviews. Technical rounds covered DSA, system design, and coding. The behavioral round focused on past projects and teamwork experiences.",
        interviewLevel: "On-Campus",
        result: "In Progress"
      }
    ]);
    console.log('Created sample interview experiences');

    // Update test user with scheduled interviews
    testUser.scheduledInterviews = [
      {
        companyName: "Amazon",
        interviewDate: new Date("2025-05-01T10:00:00"),
        companyId: companies[2]._id
      }
    ];
    await testUser.save();

    console.log('\nTest data created successfully!');
    console.log('\nTest User Credentials:');
    console.log('Email:', testUser.email);
    console.log('Password: Test@123');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
};

createTestData();
