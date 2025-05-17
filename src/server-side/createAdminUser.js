import mongoose from 'mongoose';
import { User } from './models/user.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

// Use a new database name specifically for admin
const MONGODB_URI = "mongodb+srv://bhargaviajaypatel:bhargavi@cluster0.p7q0r.mongodb.net/careerconnectadmin?retryWrites=true&w=majority&appName=Cluster0";

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected to admin database');

    // First, let's delete any existing admin users to start fresh
    await User.deleteMany({});
    console.log('Cleaned up existing admin users');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: 'admin',
      contactNumber: "0000000000",
      sapId: "ADMIN001",
      rollNo: "ADMIN",
      gender: "N/A",
      dob: new Date("1990-01-01"),
      tenthPercentage: 90,
      tenthSchool: "Admin School",
      twelfthPercentage: 90,
      twelfthCollege: "Admin College",
      stream: "Computer Science",
      profile: {
        firstName: "Admin",
        lastName: "User",
        phone: "0000000000",
        department: "Administration",
        graduationYear: 2024,
        skills: ["Management"]
      },
      socialLinks: {
        linkedin: "",
        github: "",
        portfolio: ""
      },
      preferences: {
        jobAlerts: true,
        emailNotifications: true
      }
    };

    // Create new admin user
    const newAdmin = await User.create(adminUser);
    console.log('Admin user created successfully');
    console.log('Admin credentials:');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdminUser(); 