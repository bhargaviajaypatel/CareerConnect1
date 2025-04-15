import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import { FaSave, FaRedo, FaChartLine } from 'react-icons/fa';
import '../Admin-CSS/StatisticsManager.css';

const StatisticsManager = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    studentsPlaced: '',
    studentsPlacedIncrease: '',
    averagePackage: '',
    averagePackageIncrease: '',
    successRate: '',
    successRateIncrease: '',
    campusRecruiters: '',
    campusRecruitersIncrease: ''
  });

  // Fetch statistics from API
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/statistics/placements');
      
      if (response.data && response.data.success) {
        setStatistics(response.data.statistics);
        // Populate form with current statistics
        setFormData({
          studentsPlaced: response.data.statistics.studentsPlaced,
          studentsPlacedIncrease: response.data.statistics.studentsPlacedIncrease,
          averagePackage: response.data.statistics.averagePackage,
          averagePackageIncrease: response.data.statistics.averagePackageIncrease,
          successRate: response.data.statistics.successRate,
          successRateIncrease: response.data.statistics.successRateIncrease,
          campusRecruiters: response.data.statistics.campusRecruiters,
          campusRecruitersIncrease: response.data.statistics.campusRecruitersIncrease
        });
      } else {
        console.log('API returned success:false. Using default values.');
        // Keep form values as is
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/api/admin/statistics/placements', formData);
      
      if (response.data && response.data.success) {
        setSuccess('Statistics updated successfully!');
        // Refresh statistics
        fetchStatistics();
      } else {
        setError('Failed to update statistics. Please try again.');
      }
    } catch (err) {
      console.error('Error saving statistics:', err);
      setError('Failed to update statistics. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="statistics-manager-container">
      <div className="statistics-manager-header">
        <h2><FaChartLine className="icon" /> Placement Statistics Manager</h2>
        <p>Update real-time placement statistics displayed on the homepage</p>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}
      
      <div className="statistics-form-container">
        <div className="current-stats">
          <h3>Current Statistics</h3>
          {loading ? (
            <div className="loading-spinner-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading current statistics...</p>
            </div>
          ) : statistics ? (
            <div className="current-stats-info">
              <p><strong>Last Updated:</strong> {formatDate(statistics.lastUpdated)}</p>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Students Placed:</span>
                  <span className="stat-value">{statistics.studentsPlaced}</span>
                  <span className="stat-increase">↑ {statistics.studentsPlacedIncrease}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Package:</span>
                  <span className="stat-value">{statistics.averagePackage}</span>
                  <span className="stat-increase">↑ {statistics.averagePackageIncrease}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Success Rate:</span>
                  <span className="stat-value">{statistics.successRate}</span>
                  <span className="stat-increase">↑ {statistics.successRateIncrease}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Campus Recruiters:</span>
                  <span className="stat-value">{statistics.campusRecruiters}</span>
                  <span className="stat-increase">↑ {statistics.campusRecruitersIncrease}</span>
                </div>
              </div>
              <button 
                className="btn btn-outline-primary refresh-btn"
                onClick={fetchStatistics}
                disabled={loading}
              >
                <FaRedo className="icon" /> Refresh
              </button>
            </div>
          ) : (
            <p>No statistics available. Create your first entry below.</p>
          )}
        </div>
        
        <h3>Update Statistics</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="studentsPlaced">Students Placed</label>
                <input
                  type="text"
                  id="studentsPlaced"
                  name="studentsPlaced"
                  value={formData.studentsPlaced}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 587+"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="studentsPlacedIncrease">Students Placed Increase</label>
                <input
                  type="text"
                  id="studentsPlacedIncrease"
                  name="studentsPlacedIncrease"
                  value={formData.studentsPlacedIncrease}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 12%"
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="averagePackage">Average Package</label>
                <input
                  type="text"
                  id="averagePackage"
                  name="averagePackage"
                  value={formData.averagePackage}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 41.65 LPA"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="averagePackageIncrease">Average Package Increase</label>
                <input
                  type="text"
                  id="averagePackageIncrease"
                  name="averagePackageIncrease"
                  value={formData.averagePackageIncrease}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 7%"
                />
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="successRate">Success Rate</label>
                <input
                  type="text"
                  id="successRate"
                  name="successRate"
                  value={formData.successRate}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 94%"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="successRateIncrease">Success Rate Increase</label>
                <input
                  type="text"
                  id="successRateIncrease"
                  name="successRateIncrease"
                  value={formData.successRateIncrease}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 5%"
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="campusRecruiters">Campus Recruiters</label>
                <input
                  type="text"
                  id="campusRecruiters"
                  name="campusRecruiters"
                  value={formData.campusRecruiters}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 50+"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="campusRecruitersIncrease">Campus Recruiters Increase</label>
                <input
                  type="text"
                  id="campusRecruitersIncrease"
                  name="campusRecruitersIncrease"
                  value={formData.campusRecruitersIncrease}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="e.g., 15%"
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="icon" /> Update Statistics
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatisticsManager;
