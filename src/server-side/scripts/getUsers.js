import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.js';

dotenv.config();

const getUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', "mongodb+srv://bhargaviajaypatel:bhargavi@cluster0.p7q0r.mongodb.net/careerconnectadmin?retryWrites=true&w=majority&appName=Cluster0");
    
    await mongoose.connect("mongodb+srv://bhargaviajaypatel:bhargavi@cluster0.p7q0r.mongodb.net/careerconnectadmin?retryWrites=true&w=majority&appName=Cluster0");
    console.log('Connected to MongoDB successfully');

    const users = await User.find({});
    console.log('\nTotal Users:', users.length);
    
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      console.log('\nExisting Users:');
      users.forEach(user => {
        console.log('\n-------------------');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`Role: ${user.isAdmin ? 'Admin' : 'User'}`);
        console.log(`Contact: ${user.contactNumber}`);
        console.log(`SAP ID: ${user.sapId}`);
        console.log(`Stream: ${user.stream}`);
        console.log('-------------------');
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to MongoDB. Please check if MongoDB is running and the connection string is correct.');
    }
  }
};

getUsers(); 