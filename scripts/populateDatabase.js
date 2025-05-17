import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

// Import models
import { User } from '../src/server-side/models/user.js';
import { Company } from '../src/server-side/models/Company.js';
import { Roadmap } from '../src/server-side/models/Roadmap.js';
import { Document } from '../src/server-side/models/Document.js';
import { Interview } from '../src/server-side/models/Experience.js';
import { Statistics } from '../src/server-side/models/Statistics.js';
import Announcement from '../src/models/Announcement.js';
import PlacementStatistic from '../src/models/PlacementStatistic.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerconnect';

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully\n');
    
    // Drop the existing database
    console.log('Dropping existing database...');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully\n');

    // Sample data
    const sampleCompanies = [
      {
        companyname: 'Google',
        jobprofile: 'Software Engineer',
        jobdescription: 'Full-stack development position',
        website: 'https://www.google.com',
        ctc: 120000,
        doi: '2024-04-15',
        eligibilityCriteria: ['B.Tech/B.E.', 'Computer Science', 'IT'],
        tenthPercentage: 80,
        twelfthPercentage: 80,
        graduationCGPA: 8.0,
        sixthSemesterCGPA: 8.0,
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        rolesAndResponsibilities: [
          'Develop and maintain web applications',
          'Work with cross-functional teams',
          'Write clean, maintainable code'
        ]
      },
      {
        companyname: 'Microsoft',
        jobprofile: 'Cloud Solutions Architect',
        jobdescription: 'Azure cloud architecture position',
        website: 'https://www.microsoft.com',
        ctc: 130000,
        doi: '2024-04-20',
        eligibilityCriteria: ['B.Tech/B.E.', 'Computer Science', 'IT'],
        tenthPercentage: 75,
        twelfthPercentage: 75,
        graduationCGPA: 7.5,
        sixthSemesterCGPA: 7.5,
        requiredSkills: ['Azure', 'Cloud Architecture', 'DevOps'],
        rolesAndResponsibilities: [
          'Design and implement cloud solutions',
          'Optimize cloud infrastructure',
          'Provide technical guidance'
        ]
      }
    ];

    const sampleDocuments = [
      {
        userId: null,
        documentType: 'RESUME',
        displayName: 'Professional Resume Template',
        mimetype: 'application/pdf',
        size: 1024 * 1024,
        originalName: {
          encryptedData: 'encrypted_resume_template.pdf',
          iv: 'iv1',
          authTag: 'tag1'
        },
        storageKey: {
          encryptedData: '/uploads/resume_template.pdf',
          iv: 'iv2',
          authTag: 'tag2'
        },
        status: 'APPROVED',
        visibility: 'PUBLIC',
        description: 'Professional resume template for software engineers',
        tags: ['resume', 'template', 'professional'],
        approvedBy: null,
        approvedAt: new Date(),
        scanResult: {
          isSafe: true,
          skipped: false,
          message: 'File scanned successfully',
          scannedAt: new Date()
        }
      },
      {
        userId: null,
        documentType: 'OTHER',
        displayName: 'Interview Preparation Guide',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024,
        originalName: {
          encryptedData: 'encrypted_interview_guide.pdf',
          iv: 'iv3',
          authTag: 'tag3'
        },
        storageKey: {
          encryptedData: '/uploads/interview_guide.pdf',
          iv: 'iv4',
          authTag: 'tag4'
        },
        status: 'APPROVED',
        visibility: 'PUBLIC',
        description: 'Comprehensive guide for technical interviews',
        tags: ['interview', 'preparation', 'technical'],
        approvedBy: null,
        approvedAt: new Date(),
        scanResult: {
          isSafe: true,
          skipped: false,
          message: 'File scanned successfully',
          scannedAt: new Date()
        }
      }
    ];

    const sampleInterviews = [
      {
        username: 'john_doe',
        companyName: 'Google',
        position: 'Software Engineer',
        experience: 'The interview process was comprehensive and challenging. Started with a coding round, followed by system design and behavioral interviews.',
        interviewLevel: 'Entry Level',
        result: 'Selected'
      },
      {
        username: 'john_doe',
        companyName: 'Microsoft',
        position: 'Software Engineer',
        experience: 'The interview focused heavily on data structures and algorithms. Had four rounds including coding and system design.',
        interviewLevel: 'Entry Level',
        result: 'On Hold'
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
        link: '#',
        active: true
      },
      {
        title: 'Resume Workshop',
        description: 'Join us for a resume building workshop with industry experts',
        link: '#',
        active: true
      }
    ];

    const samplePlacementStatistics = [
      {
        year: 2023,
        department: 'Computer Science',
        totalStudents: 100,
        placedStudents: 85,
        averagePackage: 120000,
        highestPackage: 250000,
        companiesVisited: 25
      },
      {
        year: 2023,
        department: 'Information Technology',
        totalStudents: 90,
        placedStudents: 75,
        averagePackage: 110000,
        highestPackage: 220000,
        companiesVisited: 20
      }
    ];

    // Create sample users (one admin and one regular user)
    const createUsers = async () => {
      try {
        // Check if users already exist
        const existingAdmin = await User.findOne({ email: 'admin@careerconnect.com' });
        const existingUser = await User.findOne({ email: 'john.doe@example.com' });
        let adminId, userId;

        if (!existingAdmin) {
          const adminUser = new User({
            username: 'admin',
            email: 'admin@careerconnect.com',
            password: 'Admin@123',
            role: 'admin',
            profile: {
              firstName: 'Admin',
              lastName: 'User',
              phone: '1234567890',
              department: 'Administration',
              graduationYear: 2024
            },
            contactNumber: '1234567890',
            sapId: 'ADMIN001',
            rollNo: 'ADM001',
            gender: 'Male',
            dob: '1990-01-01',
            tenthPercentage: 90,
            tenthSchool: 'ABC School',
            twelfthPercentage: 90,
            twelfthCollege: 'XYZ College',
            stream: 'Computer Science',
            sixthSemesterCGPA: 9.0,
            skills: 'Management, Administration',
            careerPreferences: {
              interestedCompanies: ['Google', 'Microsoft'],
              interestedRoles: ['Administrator', 'Manager'],
              interestedSkills: ['Leadership', 'Management'],
              careerGoals: 'Lead the organization to success'
            }
          });
          const savedAdmin = await adminUser.save();
          adminId = savedAdmin._id;
          console.log('Admin user created successfully');
        } else {
          console.log('Admin user already exists');
          adminId = existingAdmin._id;
        }

        if (!existingUser) {
          const regularUser = new User({
            username: 'john_doe',
            email: 'john.doe@example.com',
            password: 'User@123',
            role: 'user',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              phone: '9876543210',
              department: 'Computer Science',
              graduationYear: 2024
            },
            contactNumber: '9876543210',
            sapId: 'SAP001',
            rollNo: 'CS001',
            gender: 'Male',
            dob: '2000-01-01',
            tenthPercentage: 85,
            tenthSchool: 'DEF School',
            twelfthPercentage: 85,
            twelfthCollege: 'PQR College',
            stream: 'Computer Science',
            sixthSemesterCGPA: 8.5,
            skills: 'JavaScript, React, Node.js',
            careerPreferences: {
              interestedCompanies: ['Google', 'Microsoft'],
              interestedRoles: ['Software Engineer', 'Full Stack Developer'],
              interestedSkills: ['JavaScript', 'React', 'Node.js'],
              careerGoals: 'Become a senior software engineer'
            }
          });
          const savedUser = await regularUser.save();
          userId = savedUser._id;
          console.log('Regular user created successfully');
        } else {
          console.log('Regular user already exists');
          userId = existingUser._id;
        }

        // Set user IDs for documents
        sampleDocuments.forEach(doc => {
          doc.userId = userId;
          doc.approvedBy = adminId;
        });

        // Create companies if they don't exist
        const existingCompanies = await Company.find({ companyname: { $in: ['Google', 'Microsoft'] } });
        if (existingCompanies.length < 2) {
          const companies = await Company.insertMany(sampleCompanies);
          console.log('Companies created successfully');
        } else {
          console.log('Companies already exist');
        }

        // Create roadmaps if they don't exist
        const existingRoadmaps = await Roadmap.find();
        if (existingRoadmaps.length === 0) {
          const companies = await Company.find({ companyname: { $in: ['Google', 'Microsoft'] } });
          const sampleRoadmaps = [
            {
              companyId: companies[0]._id, // Google
              jobProfile: 'Software Engineer',
              skills: [
                {
                  skillName: 'Frontend Development',
                  resources: [
                    {
                      title: 'React Fundamentals',
                      type: 'video',
                      url: 'https://example.com/react-fundamentals',
                      description: 'Learn the basics of React'
                    },
                    {
                      title: 'Advanced React Patterns',
                      type: 'article',
                      url: 'https://example.com/advanced-react',
                      description: 'Master advanced React concepts'
                    }
                  ]
                },
                {
                  skillName: 'Backend Development',
                  resources: [
                    {
                      title: 'Node.js Basics',
                      type: 'video',
                      url: 'https://example.com/nodejs-basics',
                      description: 'Learn Node.js fundamentals'
                    },
                    {
                      title: 'RESTful API Design',
                      type: 'article',
                      url: 'https://example.com/rest-api',
                      description: 'Learn how to design RESTful APIs'
                    }
                  ]
                }
              ]
            },
            {
              companyId: companies[1]._id, // Microsoft
              jobProfile: 'Cloud Solutions Architect',
              skills: [
                {
                  skillName: 'Azure Cloud',
                  resources: [
                    {
                      title: 'Azure Fundamentals',
                      type: 'video',
                      url: 'https://example.com/azure-fundamentals',
                      description: 'Learn Azure basics'
                    },
                    {
                      title: 'Azure Architecture',
                      type: 'article',
                      url: 'https://example.com/azure-architecture',
                      description: 'Master Azure architecture patterns'
                    }
                  ]
                },
                {
                  skillName: 'DevOps',
                  resources: [
                    {
                      title: 'DevOps Principles',
                      type: 'video',
                      url: 'https://example.com/devops-principles',
                      description: 'Learn DevOps fundamentals'
                    },
                    {
                      title: 'CI/CD Pipeline Design',
                      type: 'article',
                      url: 'https://example.com/cicd',
                      description: 'Learn how to design CI/CD pipelines'
                    }
                  ]
                }
              ]
            }
          ];
          await Roadmap.insertMany(sampleRoadmaps);
          console.log('Roadmaps created successfully');
        } else {
          console.log('Roadmaps already exist');
        }

        // Create documents if they don't exist
        const existingDocuments = await Document.find();
        if (existingDocuments.length === 0) {
          await Document.insertMany(sampleDocuments);
          console.log('Documents created successfully');
        } else {
          console.log('Documents already exist');
        }

        const existingInterviews = await Interview.find();
        if (existingInterviews.length === 0) {
          await Interview.insertMany(sampleInterviews);
          console.log('Interviews created successfully');
        } else {
          console.log('Interviews already exist');
        }

        const existingStatistics = await Statistics.find();
        if (existingStatistics.length === 0) {
          await Statistics.insertMany(sampleStatistics);
          console.log('Statistics created successfully');
        } else {
          console.log('Statistics already exist');
        }

        const existingAnnouncements = await Announcement.find();
        if (existingAnnouncements.length === 0) {
          await Announcement.insertMany(sampleAnnouncements);
          console.log('Announcements created successfully');
        } else {
          console.log('Announcements already exist');
        }

        const existingPlacementStats = await PlacementStatistic.find();
        if (existingPlacementStats.length === 0) {
          await PlacementStatistic.insertMany(samplePlacementStatistics);
          console.log('Placement statistics created successfully');
        } else {
          console.log('Placement statistics already exist');
        }

      } catch (error) {
        console.error('Error creating data:', error);
        throw error;
      }
    };

    // Main function to populate the database
    const populateDatabase = async () => {
      try {
        await createUsers();
        console.log('Database populated successfully');
      } catch (error) {
        console.error('Error populating database:', error);
      } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
      }
    };

    // Run the script
    await populateDatabase();
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });