import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/server-side/models/user.js';

dotenv.config();

const checkUsers = async () => {
  try {
    const uri = process.env.MONGODB_URI.replace('CareerConnect', 'careerconnect');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Find all users
    const users = await User.find({});
    console.log('\nAll users in database:');
    users.forEach(user => {
      console.log(`\nUsername: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password (hashed): ${user.password}`);
      console.log('------------------------');
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
};

checkUsers(); 