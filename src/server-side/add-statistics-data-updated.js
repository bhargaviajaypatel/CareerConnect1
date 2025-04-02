import { MongoClient } from 'mongodb';
import { Statistics } from './models/Statistics.js';
import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/PlaceX", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  addStatisticsData();
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

async function addStatisticsData() {
  try {
    // First, clear existing statistics data
    await Statistics.deleteMany({});
    console.log('Cleared existing statistics data');
    
    // Sample data for statistics
    const statisticsData = [
      // CTC Statistics for different years
      {
        academicYear: '2019-20',
        ctcStatistics: { averageCTC: 10.45, medianCTC: 7.80 },
        placementStatistics: { department: 'COMP', percentagePlaced: 92 },
        higherStudiesStatistics: { department: 'COMP', percentageHigherStudies: 12 }
      },
      {
        academicYear: '2020-21',
        ctcStatistics: { averageCTC: 11.22, medianCTC: 8.56 },
        placementStatistics: { department: 'COMP', percentagePlaced: 95 },
        higherStudiesStatistics: { department: 'COMP', percentageHigherStudies: 14 }
      },
      {
        academicYear: '2021-22',
        ctcStatistics: { averageCTC: 12.91, medianCTC: 10.75 },
        placementStatistics: { department: 'COMP', percentagePlaced: 98 },
        higherStudiesStatistics: { department: 'COMP', percentageHigherStudies: 18 }
      },
      {
        academicYear: '2022-23',
        ctcStatistics: { averageCTC: 15.08, medianCTC: 12.00 },
        placementStatistics: { department: 'COMP', percentagePlaced: 100 },
        higherStudiesStatistics: { department: 'COMP', percentageHigherStudies: 22 }
      },
      {
        academicYear: '2023-24',
        ctcStatistics: { averageCTC: 15.14, medianCTC: 13.33 },
        placementStatistics: { department: 'COMP', percentagePlaced: 100 },
        higherStudiesStatistics: { department: 'COMP', percentageHigherStudies: 25 }
      },
      
      // Data for ECS department
      {
        academicYear: '2019-20',
        ctcStatistics: { averageCTC: 9.75, medianCTC: 7.50 },
        placementStatistics: { department: 'ECS', percentagePlaced: 89 },
        higherStudiesStatistics: { department: 'ECS', percentageHigherStudies: 17 }
      },
      {
        academicYear: '2020-21',
        ctcStatistics: { averageCTC: 10.50, medianCTC: 8.20 },
        placementStatistics: { department: 'ECS', percentagePlaced: 92 },
        higherStudiesStatistics: { department: 'ECS', percentageHigherStudies: 19 }
      },
      {
        academicYear: '2021-22',
        ctcStatistics: { averageCTC: 12.30, medianCTC: 10.10 },
        placementStatistics: { department: 'ECS', percentagePlaced: 95 },
        higherStudiesStatistics: { department: 'ECS', percentageHigherStudies: 21 }
      },
      {
        academicYear: '2022-23',
        ctcStatistics: { averageCTC: 14.75, medianCTC: 11.80 },
        placementStatistics: { department: 'ECS', percentagePlaced: 98 },
        higherStudiesStatistics: { department: 'ECS', percentageHigherStudies: 25 }
      },
      {
        academicYear: '2023-24',
        ctcStatistics: { averageCTC: 14.90, medianCTC: 12.95 },
        placementStatistics: { department: 'ECS', percentagePlaced: 99 },
        higherStudiesStatistics: { department: 'ECS', percentageHigherStudies: 21 }
      },
      
      // Data for AIDS department
      {
        academicYear: '2019-20',
        ctcStatistics: { averageCTC: 9.10, medianCTC: 7.30 },
        placementStatistics: { department: 'AIDS', percentagePlaced: 87 },
        higherStudiesStatistics: { department: 'AIDS', percentageHigherStudies: 19 }
      },
      {
        academicYear: '2020-21',
        ctcStatistics: { averageCTC: 9.80, medianCTC: 7.90 },
        placementStatistics: { department: 'AIDS', percentagePlaced: 90 },
        higherStudiesStatistics: { department: 'AIDS', percentageHigherStudies: 21 }
      },
      {
        academicYear: '2021-22',
        ctcStatistics: { averageCTC: 11.50, medianCTC: 9.80 },
        placementStatistics: { department: 'AIDS', percentagePlaced: 93 },
        higherStudiesStatistics: { department: 'AIDS', percentageHigherStudies: 23 }
      },
      {
        academicYear: '2022-23',
        ctcStatistics: { averageCTC: 13.90, medianCTC: 11.20 },
        placementStatistics: { department: 'AIDS', percentagePlaced: 97 },
        higherStudiesStatistics: { department: 'AIDS', percentageHigherStudies: 24 }
      },
      {
        academicYear: '2023-24',
        ctcStatistics: { averageCTC: 14.20, medianCTC: 12.50 },
        placementStatistics: { department: 'AIDS', percentagePlaced: 98 },
        higherStudiesStatistics: { department: 'AIDS', percentageHigherStudies: 24 }
      },
      
      // Data for MECH department
      {
        academicYear: '2019-20',
        ctcStatistics: { averageCTC: 8.20, medianCTC: 6.80 },
        placementStatistics: { department: 'MECH', percentagePlaced: 82 },
        higherStudiesStatistics: { department: 'MECH', percentageHigherStudies: 16 }
      },
      {
        academicYear: '2020-21',
        ctcStatistics: { averageCTC: 8.90, medianCTC: 7.20 },
        placementStatistics: { department: 'MECH', percentagePlaced: 85 },
        higherStudiesStatistics: { department: 'MECH', percentageHigherStudies: 18 }
      },
      {
        academicYear: '2021-22',
        ctcStatistics: { averageCTC: 10.20, medianCTC: 8.90 },
        placementStatistics: { department: 'MECH', percentagePlaced: 88 },
        higherStudiesStatistics: { department: 'MECH', percentageHigherStudies: 22 }
      },
      {
        academicYear: '2022-23',
        ctcStatistics: { averageCTC: 12.50, medianCTC: 10.50 },
        placementStatistics: { department: 'MECH', percentagePlaced: 92 },
        higherStudiesStatistics: { department: 'MECH', percentageHigherStudies: 23 }
      },
      {
        academicYear: '2023-24',
        ctcStatistics: { averageCTC: 13.10, medianCTC: 11.80 },
        placementStatistics: { department: 'MECH', percentagePlaced: 95 },
        higherStudiesStatistics: { department: 'MECH', percentageHigherStudies: 23 }
      },
      
      // Data for EXTC department
      {
        academicYear: '2019-20',
        ctcStatistics: { averageCTC: 8.50, medianCTC: 7.00 },
        placementStatistics: { department: 'EXTC', percentagePlaced: 84 },
        higherStudiesStatistics: { department: 'EXTC', percentageHigherStudies: 15 }
      },
      {
        academicYear: '2020-21',
        ctcStatistics: { averageCTC: 9.20, medianCTC: 7.60 },
        placementStatistics: { department: 'EXTC', percentagePlaced: 87 },
        higherStudiesStatistics: { department: 'EXTC', percentageHigherStudies: 17 }
      },
      {
        academicYear: '2021-22',
        ctcStatistics: { averageCTC: 10.80, medianCTC: 9.20 },
        placementStatistics: { department: 'EXTC', percentagePlaced: 90 },
        higherStudiesStatistics: { department: 'EXTC', percentageHigherStudies: 20 }
      },
      {
        academicYear: '2022-23',
        ctcStatistics: { averageCTC: 12.90, medianCTC: 10.80 },
        placementStatistics: { department: 'EXTC', percentagePlaced: 94 },
        higherStudiesStatistics: { department: 'EXTC', percentageHigherStudies: 22 }
      },
      {
        academicYear: '2023-24',
        ctcStatistics: { averageCTC: 13.50, medianCTC: 12.10 },
        placementStatistics: { department: 'EXTC', percentagePlaced: 96 },
        higherStudiesStatistics: { department: 'EXTC', percentageHigherStudies: 24 }
      },
      
      // Data for IT department
      {
        academicYear: '2019-20',
        ctcStatistics: { averageCTC: 10.10, medianCTC: 7.60 },
        placementStatistics: { department: 'IT', percentagePlaced: 91 },
        higherStudiesStatistics: { department: 'IT', percentageHigherStudies: 14 }
      },
      {
        academicYear: '2020-21',
        ctcStatistics: { averageCTC: 11.00, medianCTC: 8.30 },
        placementStatistics: { department: 'IT', percentagePlaced: 94 },
        higherStudiesStatistics: { department: 'IT', percentageHigherStudies: 16 }
      },
      {
        academicYear: '2021-22',
        ctcStatistics: { averageCTC: 12.70, medianCTC: 10.50 },
        placementStatistics: { department: 'IT', percentagePlaced: 97 },
        higherStudiesStatistics: { department: 'IT', percentageHigherStudies: 19 }
      },
      {
        academicYear: '2022-23',
        ctcStatistics: { averageCTC: 14.90, medianCTC: 11.90 },
        placementStatistics: { department: 'IT', percentagePlaced: 99 },
        higherStudiesStatistics: { department: 'IT', percentageHigherStudies: 21 }
      },
      {
        academicYear: '2023-24',
        ctcStatistics: { averageCTC: 15.00, medianCTC: 13.20 },
        placementStatistics: { department: 'IT', percentagePlaced: 100 },
        higherStudiesStatistics: { department: 'IT', percentageHigherStudies: 23 }
      }
    ];
    
    // Insert the sample data
    await Statistics.insertMany(statisticsData);
    console.log(`${statisticsData.length} statistics records inserted successfully`);
    
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error adding statistics data:', error);
  }
}