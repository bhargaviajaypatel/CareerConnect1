import mongoose from 'mongoose';
import { User } from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI.replace('CareerConnect', 'careerconnect');

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const adminUser = {
      name: "Admin User",
      email: "admin@careerconnect.com",
      password: "admin123",
      contactNumber: "9876543210",
      sapId: "ADMIN001",
      rollNo: "ADMIN001",
      gender: "Other",
      dob: "1990-01-01",
      tenthPercentage: 90,
      tenthSchool: "Admin School",
      twelfthPercentage: 90,
      twelfthCollege: "Admin College",
      stream: "Computer Science",
      sixthSemesterCGPA: 9.5,
      isAdmin: true
    };

    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (!existingAdmin) {
      await User.create(adminUser);
      console.log('Admin user created successfully');
      console.log('Admin credentials:');
      console.log('Email:', adminUser.email);
      console.log('Password:', adminUser.password);
    } else {
      console.log('Admin user already exists');
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdminUser(); 