import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import { useNavigate } from 'react-router-dom';
import AdminHome from "../AdminHomeComponents/AdminHome.js";
import Footer from "../AdminReusableComponents/AdminFooter.js";
import '../Admin-CSS/ScheduledInterviewData.css';
import { FaUserGraduate, FaBuilding, FaUserCheck, FaUserTimes, FaSearch, FaFilter } from 'react-icons/fa';

function ScheduledInterviewData() {
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [auth, setAuth] = useState(false);
  const [filterCompany, setFilterCompany] = useState('');
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const navigate = useNavigate();

  // Ensure Bootstrap JS is loaded for UI functionality
  useEffect(() => {
    // Check if Bootstrap JS is already loaded
    if (!window.bootstrap) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
      script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!isAuthenticated || userRole !== 'Admin') {
      console.log('Access denied: User is not authenticated as admin');
      navigate('/login');
      return;
    }

    // Verify authentication on server
    axios.get('/auth/verify', {
      params: { email: userEmail },
      headers: { 'user-email': userEmail }
    })
      .then(response => {
        if (response.data === 'Admin') {
          console.log('Admin authentication verified');
          setAuth(true);
          fetchCompanyData();
        } else {
          console.log('Server verification failed: Not admin');
          // Clear auth data and redirect
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          navigate('/login');
        }
      })
      .catch(error => {
        console.error('Authentication verification error:', error);
        // Clear auth data and redirect on error
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        navigate('/login');
      });
  }, [navigate]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/companyApplicants');
      setCompanyData(response.data);
      
      // Extract unique company names for filtering
      const companies = response.data.map(company => company.companyName);
      setUniqueCompanies([...new Set(companies)]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setLoading(false);
    }
  };

  const handleUpdatePlacementStatus = async (userId, companyId, status) => {
    try {
      const response = await axios.post('/auth/updatePlacementStatus', {
        userId,
        companyId,
        status
      });

      console.log(response.data);
      
      // Show a nicer notification instead of an alert
      const notificationElement = document.getElementById('notification');
      notificationElement.textContent = response.data.message;
      notificationElement.className = 'notification success';
      notificationElement.style.display = 'block';
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        notificationElement.style.display = 'none';
      }, 3000);
      
      // Refresh data
      fetchCompanyData();
    } catch (error) {
      console.error('Error updating placement status:', error.response?.data?.message || 'Error updating status');
      
      // Show error notification
      const notificationElement = document.getElementById('notification');
      notificationElement.textContent = error.response?.data?.message || 'Error updating status';
      notificationElement.className = 'notification error';
      notificationElement.style.display = 'block';
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        notificationElement.style.display = 'none';
      }, 3000);
    }
  };

  // Apply company filter if selected
  const applyFilters = () => {
    if (!filterCompany) return companyData;
    return companyData.filter(company => company.companyName === filterCompany);
  };

  // Apply search term
  const applySearch = (companies) => {
    if (!searchTerm) return companies;
    
    return companies.map(company => ({
      ...company,
      applicants: company.applicants.filter(applicant => 
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(company => company.applicants.length > 0);
  };

  // Get filtered data
  const getFilteredData = () => {
    const filteredByCompany = applyFilters();
    return applySearch(filteredByCompany);
  };

  // Calculate statistics
  const totalCompanies = companyData.length;
  const totalApplicants = companyData.reduce((sum, company) => sum + company.applicants.length, 0);
  const filteredData = getFilteredData();
  const filteredApplicants = filteredData.reduce((sum, company) => sum + company.applicants.length, 0);

  return (
    <>
      <AdminHome />
      {auth ? (
        <div className="interview-data-container">
          <div className="page-header">
            <h1>Interview Management Dashboard</h1>
            <p>Track and update applicant interview results and placement status</p>
          </div>
          
          <div id="notification" className="notification" style={{display: 'none'}}></div>
          
          {/* Summary Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <FaBuilding />
              </div>
              <div className="stat-info">
                <h3>{totalCompanies}</h3>
                <p>Companies</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaUserGraduate />
              </div>
              <div className="stat-info">
                <h3>{totalApplicants}</h3>
                <p>Total Applicants</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaUserCheck />
              </div>
              <div className="stat-info">
                <h3>{filteredApplicants}</h3>
                <p>Filtered Applicants</p>
              </div>
            </div>
          </div>
          
          {/* Search and Filter Container */}
          <div className="filter-container" style={{marginBottom: '2rem', gap: '1rem', flexDirection: 'row'}}>
            <div style={{flex: '1'}}>
              <input 
                type="text" 
                placeholder="Search by company or applicant name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div style={{width: '250px'}}>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="filter-input"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map((company, index) => (
                  <option key={index} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading application data...</p>
            </div>
          ) : (
            filteredData.length > 0 ? (
              <div className="application-table-container">
                <table className="application-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Applicant</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((company, index) => (
                      <React.Fragment key={index}>
                        {company.applicants.map((applicant, appIndex) => (
                          <tr key={`${index}-${appIndex}`} className="table-row">
                            <td>
                              <div className="company-cell">
                                <span className="company-icon"><FaBuilding /></span>
                                <span>{company.companyName}</span>
                              </div>
                            </td>
                            <td>
                              <div className="applicant-cell">
                                <span className="applicant-icon"><FaUserGraduate /></span>
                                <span>{applicant.name}</span>
                              </div>
                            </td>
                            <td>{applicant.email}</td>
                            <td className="actions-cell">
                              <button 
                                className="action-button success"
                                onClick={() => handleUpdatePlacementStatus(applicant.userId, company.companyId, 'Placed')}
                              >
                                <FaUserCheck /> Interview Cleared
                              </button>
                              <button 
                                className="action-button danger"
                                onClick={() => handleUpdatePlacementStatus(applicant.userId, company.companyId, 'Unplaced')}
                              >
                                <FaUserTimes /> Interview Failed
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No matching results found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button 
                  className="filter-button mt-3" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCompany('');
                  }}
                >
                  <FaFilter /> Clear Filters
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="loading-container mt-5 pt-5">
          <div className="spinner"></div>
          <p>Verifying authentication...</p>
        </div>
      )}
      <Footer />
    </>
  );
}

export default ScheduledInterviewData;
