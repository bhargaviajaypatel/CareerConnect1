import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import '../Home-CSS/PlacementStatistics.css';

const PlacementStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/statistics/summary');
        if (response.data.status) {
          setStatistics(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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

  if (!statistics) {
    return (
      <section className="placement-statistics-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="section-title">Placement Statistics</h2>
              <p className="section-subtitle">No statistics available.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="placement-statistics-section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="section-title">Placement Statistics</h2>
            <p className="section-subtitle">Tech Institute of Engineering placement achievements</p>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-3">
            <div className="statistic-card">
              <div className="statistic-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="statistic-content">
                <h3>{statistics.studentsPlaced}</h3>
                <p>Students Placed</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="statistic-card">
              <div className="statistic-icon">
                <i className="fas fa-building"></i>
              </div>
              <div className="statistic-content">
                <h3>{statistics.companies}</h3>
                <p>Partner Companies</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="statistic-card">
              <div className="statistic-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="statistic-content">
                <h3>{statistics.placementRate}%</h3>
                <p>Placement Rate</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="statistic-card">
              <div className="statistic-icon">
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="statistic-content">
                <h3>{statistics.highestPackage} LPA</h3>
                <p>Highest Package</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlacementStatistics;
