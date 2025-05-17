import { MongoClient } from 'mongodb';
import { MOCK_USERS } from '../../mockData/users.js';
import { MOCK_COMPANIES } from '../../mockData/companies.js';
import { MOCK_STATISTICS } from '../../mockData/statistics.js';
import { MOCK_INTERVIEWS, MOCK_SCHEDULED_INTERVIEWS } from '../../mockData/interviews.js';

const uri = 'mongodb+srv://bhargaviajaypatel:bhargavi@cluster0.p7q0r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'careerconnect';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    // Users
    await db.collection('users').deleteMany({});
    await db.collection('users').insertMany(MOCK_USERS);

    // Companies
    await db.collection('companies').deleteMany({});
    await db.collection('companies').insertMany(MOCK_COMPANIES);

    // Statistics (store as a single document)
    await db.collection('statistics').deleteMany({});
    await db.collection('statistics').insertOne(MOCK_STATISTICS);

    // Interviews
    await db.collection('interviews').deleteMany({});
    await db.collection('interviews').insertMany(MOCK_INTERVIEWS);

    // Scheduled Interviews
    await db.collection('scheduled_interviews').deleteMany({});
    await db.collection('scheduled_interviews').insertMany(MOCK_SCHEDULED_INTERVIEWS);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
  }
}

seed();
