import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../src/server-side/models/user.js';

dotenv.config();

async function updateAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI.replace('CareerConnect', 'careerconnect');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully\n');

        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.findOneAndUpdate(
            { email: 'admin@gmail.com' },
            { 
                $set: {
                    password: hashedPassword,
                    role: 'admin'
                }
            },
            { new: true }
        );

        if (result) {
            console.log('Admin user updated successfully');
            console.log('Admin credentials:');
            console.log('Email: admin@gmail.com');
            console.log('Password: Admin@123');
        } else {
            console.log('Admin user not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

updateAdmin(); 