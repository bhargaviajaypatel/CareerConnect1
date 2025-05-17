import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../src/server-side/models/user.js';

dotenv.config();

async function updateUsers() {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI.replace('CareerConnect', 'careerconnect');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully\n');

        const password = 'User@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.updateMany(
            { role: { $ne: 'admin' } },
            { 
                $set: {
                    password: hashedPassword,
                    role: 'user'
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`${result.modifiedCount} users updated successfully`);
            console.log('Regular user credentials:');
            console.log('Password: User@123');
        } else {
            console.log('No users were updated');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

updateUsers(); 