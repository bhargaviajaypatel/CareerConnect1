import mongoose from 'mongoose';
import { User } from './models/user.js';
import { Company } from './models/Company.js';
import { Interview } from './models/Experience.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAllData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CareerConnect');
    console.log('MongoDB connected');
    
    // Check users
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = await User.countDocuments({ isAdmin: false });
    
    console.log('\n===== USER DATA =====');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admin Users: ${adminUsers}`);
    console.log(`Regular Users: ${regularUsers}`);
    
    // Check special user
    const specialUser = await User.findOne({ email: 'student@careerconnect.com' });
    if (specialUser) {
      console.log('\n===== SPECIAL USER CREDENTIALS =====');
      console.log(`Email: ${specialUser.email}`);
      console.log(`Password: ${specialUser.password}`);
      console.log(`Name: ${specialUser.name}`);
      
      // Check if this user has applied to companies
      console.log(`Applied to ${specialUser.appliedCompanies.length} companies`);
      
      if (specialUser.placementStatus === 'Placed') {
        console.log(`Placed at: ${specialUser.companyPlaced}`);
      } else {
        console.log(`Placement Status: ${specialUser.placementStatus}`);
      }
    }
    
    // Check companies
    const companies = await Company.find();
    console.log('\n===== COMPANY DATA =====');
    console.log(`Total Companies: ${companies.length}`);
    
    // Top 5 companies by package
    const topCompaniesByPackage = [...companies].sort((a, b) => b.ctc - a.ctc).slice(0, 5);
    console.log('\nTop 5 Companies by Package:');
    topCompaniesByPackage.forEach((company, index) => {
      console.log(`${index+1}. ${company.companyname} - ${company.ctc} LPA (Role: ${company.jobprofile})`);
    });
    
    // Check interview experiences
    const interviews = await Interview.find();
    console.log('\n===== INTERVIEW EXPERIENCE DATA =====');
    console.log(`Total Interview Experiences: ${interviews.length}`);
    
    // Count by difficulty
    const easyInterviews = interviews.filter(i => i.interviewLevel === 'Easy').length;
    const mediumInterviews = interviews.filter(i => i.interviewLevel === 'Medium').length;
    const hardInterviews = interviews.filter(i => i.interviewLevel === 'Hard').length;
    
    console.log(`Difficulty Distribution: Easy (${easyInterviews}), Medium (${mediumInterviews}), Hard (${hardInterviews})`);
    
    // Count by result
    const resultCounts = interviews.reduce((acc, interview) => {
      acc[interview.result] = (acc[interview.result] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nResult Distribution:');
    Object.entries(resultCounts).forEach(([result, count]) => {
      console.log(`${result}: ${count}`);
    });
    
    // Check placement statistics
    console.log('\n===== PLACEMENT STATISTICS =====');
    const placedStudents = await User.countDocuments({ placementStatus: 'Placed' });
    const unplacedStudents = await User.countDocuments({ placementStatus: 'Not Placed' });
    const interviewScheduled = await User.countDocuments({ placementStatus: 'Interview Scheduled' });
    
    console.log(`Total Students: ${regularUsers}`);
    console.log(`Placed Students: ${placedStudents} (${Math.round(placedStudents/regularUsers*100)}%)`);
    console.log(`Unplaced Students: ${unplacedStudents} (${Math.round(unplacedStudents/regularUsers*100)}%)`);
    console.log(`Interview Scheduled: ${interviewScheduled} (${Math.round(interviewScheduled/regularUsers*100)}%)`);
    
    // Top companies by placements
    const placementCounts = {};
    const placedUsers = await User.find({ placementStatus: 'Placed' });
    
    placedUsers.forEach(user => {
      const company = user.companyPlaced;
      if (company) {
        placementCounts[company] = (placementCounts[company] || 0) + 1;
      }
    });
    
    const topPlacementCompanies = Object.entries(placementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    console.log('\nTop Companies by Placements:');
    topPlacementCompanies.forEach((entry, index) => {
      console.log(`${index+1}. ${entry[0]} - ${entry[1]} students placed`);
    });
    
    // Company with highest package
    const highestPackageCompany = companies.sort((a, b) => b.ctc - a.ctc)[0];
    console.log(`\nHighest Package: ${highestPackageCompany.companyname} - ${highestPackageCompany.ctc} LPA (${highestPackageCompany.jobprofile})`);
    
    // Application statistics
    const usersWithAppliedCompanies = await User.find({ appliedCompanies: { $exists: true, $ne: [] } });
    const avgApplicationsPerUser = usersWithAppliedCompanies.reduce((sum, user) => sum + user.appliedCompanies.length, 0) / usersWithAppliedCompanies.length;
    
    console.log('\n===== APPLICATION STATISTICS =====');
    console.log(`Users with Applications: ${usersWithAppliedCompanies.length}`);
    console.log(`Average Applications per User: ${avgApplicationsPerUser.toFixed(2)}`);
    
    // Company application stats
    console.log('\nCompany Application Stats:');
    const applicationStats = await Promise.all(companies.map(async company => {
      const applicantCount = await User.countDocuments({ appliedCompanies: company._id });
      return {
        companyName: company.companyname,
        applicants: applicantCount,
        package: company.ctc
      };
    }));
    
    applicationStats.sort((a, b) => b.applicants - a.applicants);
    applicationStats.slice(0, 5).forEach((stat, index) => {
      console.log(`${index+1}. ${stat.companyName} - ${stat.applicants} applicants (Package: ${stat.package} LPA)`);
    });
    
    // Success rate by company
    console.log('\nSelection Rate by Company:');
    const companySuccessStats = await Promise.all(companies.slice(0, 5).map(async company => {
      const totalInterviews = await Interview.countDocuments({ companyName: company.companyname });
      const successfulInterviews = await Interview.countDocuments({ 
        companyName: company.companyname,
        result: 'Selected'
      });
      
      const successRate = totalInterviews > 0 ? (successfulInterviews / totalInterviews) * 100 : 0;
      
      return {
        companyName: company.companyname,
        totalInterviews,
        successfulInterviews,
        successRate: successRate.toFixed(1)
      };
    }));
    
    companySuccessStats
      .filter(stat => stat.totalInterviews > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .forEach((stat, index) => {
        console.log(`${index+1}. ${stat.companyName} - ${stat.successRate}% (${stat.successfulInterviews}/${stat.totalInterviews})`);
      });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
};

// Run the function
checkAllData(); 