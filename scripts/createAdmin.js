import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/server-side/models/user.js';

dotenv.config();

const createAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI.replace('CareerConnect', 'careerconnect');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@careerconnect.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
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

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Admin credentials:');
    console.log('Email: admin@careerconnect.com');
    console.log('Password: Admin@123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdmin(); 