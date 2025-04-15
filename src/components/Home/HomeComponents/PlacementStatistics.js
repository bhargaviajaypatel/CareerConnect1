import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../api/axiosConfig.js';
import '../Home-CSS/PlacementStatistics.css';

const PlacementStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data as fallback - based on previous implementation
  const MOCK_STATISTICS = {
    studentsPlaced: "587+",
    studentsPlacedIncrease: "12%",
    averagePackage: "41.65 LPA",
    averagePackageIncrease: "7%",
    successRate: "94%",
    successRateIncrease: "5%",
    campusRecruiters: "50+",
    campusRecruitersIncrease: "15%"
  };

  // Create a memoized fetch function that can be reused
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      // Try to fetch from the database first
      const response = await axios.get('/api/statistics/placements');
      
      if (response.data && response.data.success) {
        console.log('Fetched real-time statistics:', response.data.statistics);
        setStatistics(response.data.statistics);
      } else {
        console.log("API returned success:false or invalid data format. Using mock data.");
        // If API returns failure, try to fetch from the database directly
        try {
          const dbResponse = await axios.get('/api/placement-stats');
          if (dbResponse.data && dbResponse.data.length > 0) {
            // Format the data from the database
            const latestStats = dbResponse.data[0];
            setStatistics({
              studentsPlaced: latestStats.studentsPlaced || MOCK_STATISTICS.studentsPlaced,
              studentsPlacedIncrease: latestStats.studentsPlacedIncrease || MOCK_STATISTICS.studentsPlacedIncrease,
              averagePackage: latestStats.averagePackage || MOCK_STATISTICS.averagePackage,
              averagePackageIncrease: latestStats.averagePackageIncrease || MOCK_STATISTICS.averagePackageIncrease,
              successRate: latestStats.successRate || MOCK_STATISTICS.successRate,
              successRateIncrease: latestStats.successRateIncrease || MOCK_STATISTICS.successRateIncrease,
              campusRecruiters: latestStats.campusRecruiters || MOCK_STATISTICS.campusRecruiters,
              campusRecruitersIncrease: latestStats.campusRecruitersIncrease || MOCK_STATISTICS.campusRecruitersIncrease,
              lastUpdated: latestStats.updatedAt || new Date()
            });
          } else {
            // If no data in database, use mock data
            setStatistics(MOCK_STATISTICS);
          }
        } catch (dbError) {
          console.log("Error fetching from database directly:", dbError);
          setStatistics(MOCK_STATISTICS);
        }
      }
    } catch (error) {
      console.log("Error fetching placement statistics:", error);
      // Fallback to mock data on error
      setStatistics(MOCK_STATISTICS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchStatistics();
    
    // Set up polling interval for real-time updates (every 30 seconds)
    const intervalId = setInterval(() => {
      console.log('Refreshing placement statistics...');
      fetchStatistics();
    }, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchStatistics]);

  // If data is still loading or not available, show loading or use mock data
  if (loading) {
    return (
      <section className="placement-statistics-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="section-title">Placement Statistics</h2>
              <p className="section-subtitle">Loading statistics...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Use statistics data or fallback to mock data if not available
  const stats = statistics || MOCK_STATISTICS;
  
  // Format the last updated time if available
  const lastUpdated = statistics?.lastUpdated ? new Date(statistics.lastUpdated).toLocaleString() : null;

  return (
    <section className="placement-statistics-section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="section-title">Placement Statistics</h2>
            <p className="section-subtitle">Tech Institute of Engineering placement achievements {lastUpdated && <span className="last-updated">(Last updated: {lastUpdated})</span>}</p>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-3">
            <div className="statistic-card">
              <h3 className="statistic-value">{stats.studentsPlaced}</h3>
              <p className="statistic-label">Students Placed</p>
              <div className="progress-container">
                <div className="progress-bar"></div>
              </div>
              <p className="statistic-increase">
                <span className="increase-icon">↑</span> {stats.studentsPlacedIncrease} increase
              </p>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="statistic-card">
              <h3 className="statistic-value">{stats.averagePackage}</h3>
              <p className="statistic-label">Average Package</p>
              <div className="progress-container">
                <div className="progress-bar"></div>
              </div>
              <p className="statistic-increase">
                <span className="increase-icon">↑</span> {stats.averagePackageIncrease} increase
              </p>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="statistic-card">
              <h3 className="statistic-value">{stats.successRate}</h3>
              <p className="statistic-label">Success Rate</p>
              <div className="progress-container">
                <div className="progress-bar"></div>
              </div>
              <p className="statistic-increase">
                <span className="increase-icon">↑</span> {stats.successRateIncrease} increase
              </p>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="statistic-card">
              <h3 className="statistic-value">{stats.campusRecruiters}</h3>
              <p className="statistic-label">Campus Recruiters</p>
              <div className="progress-container">
                <div className="progress-bar"></div>
              </div>
              <p className="statistic-increase">
                <span className="increase-icon">↑</span> {stats.campusRecruitersIncrease} increase
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlacementStatistics;
