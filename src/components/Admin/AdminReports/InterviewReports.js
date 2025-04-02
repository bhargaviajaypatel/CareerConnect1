import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.js';
import AdminHome from '../AdminHomeComponents/AdminHome.js';
import Footer from '../AdminReusableComponents/AdminFooter.js';
import '../Admin-CSS/InterviewReports.css';
import { 
  FaBuilding, FaSearch, FaFilter, FaUserGraduate, FaListAlt, 
  FaUserAlt, FaEnvelope, FaEye, FaCheckCircle, FaTimesCircle,
  FaSortAmountDown, FaSortAmountUp
} from 'react-icons/fa';

function InterviewReports() {
  const [applicantData, setApplicantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [activeCompany, setActiveCompany] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const navigate = useNavigate();

  // Ensure Bootstrap JS is loaded for accordion functionality
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
          fetchApplicantData();
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
        setError('Authentication failed. Please try again.');
        // Clear auth data and redirect on error
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        navigate('/login');
      });
  }, [navigate]);

  const fetchApplicantData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/companyApplicants');
      console.log('API response:', response.data);
      
      // Sort the data by applicant count initially
      const sortedData = sortCompanies(response.data, sortOrder);
      setApplicantData(sortedData);
      
      // Extract unique company names for filtering
      const companies = response.data.map(company => company.companyName);
      setUniqueCompanies([...new Set(companies)].filter(Boolean).sort());
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applicant data:', err);
      setError('Failed to fetch applicant data. Please try again later.');
      setLoading(false);
    }
  };

  const sortCompanies = (companies, order) => {
    return [...companies].sort((a, b) => {
      const countA = a.applicants.length;
      const countB = b.applicants.length;
      return order === 'asc' ? countA - countB : countB - countA;
    });
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setApplicantData(sortCompanies(applicantData, newOrder));
  };

  // Calculate total applicants and filtered applicants
  const totalApplicants = applicantData.reduce((sum, company) => sum + company.applicants.length, 0);
  
  // Filter and search logic
  const filteredData = applicantData.filter(company => {
    // Filter by company if a filter is selected
    if (filterCompany && company.companyName !== filterCompany) {
      return false;
    }
    
    // Search functionality - search in company name or applicant details
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Check if company name matches search
      if (company.companyName && company.companyName.toLowerCase().includes(searchTermLower)) {
        return true;
      }
      
      // Check if any applicant name or email matches search
      return company.applicants.some(applicant => 
        (applicant.name && applicant.name.toLowerCase().includes(searchTermLower)) ||
        (applicant.email && applicant.email.toLowerCase().includes(searchTermLower))
      );
    }
    
    return true;
  });

  // Count filtered applicants
  const filteredApplicants = filteredData.reduce((sum, company) => sum + company.applicants.length, 0);

  // Update placement status
  const updatePlacementStatus = async (userId, companyId, status) => {
    try {
      const response = await axios.post('/auth/updatePlacementStatus', {
        userId,
        companyId,
        status
      });
      
      setNotification({
        type: 'success',
        message: response.data.message || `Status updated to ${status} successfully.`
      });
      
      // Refresh data after successful update
      setTimeout(() => {
        fetchApplicantData();
      }, 1000);
    } catch (err) {
      console.error('Error updating placement status:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update status. Please try again.'
      });
    }
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle company card click - use index as fallback if companyId is not available
  const handleCompanyCardClick = (companyId, index) => {
    // Use index as fallback if companyId is undefined
    const identifier = companyId || `index-${index}`;
    
    console.log('Card clicked:', identifier);
    console.log('Current active company:', activeCompany);
    
    if (activeCompany === identifier) {
      setActiveCompany(null); // Toggle off if already active
    } else {
      setActiveCompany(identifier); // Set as active
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCompany('');
  };

  // View user profile
  const viewProfile = (userId) => {
    if (!userId) {
      console.error('Invalid user ID');
      setNotification({
        type: 'error',
        message: 'Could not view profile: Invalid user ID'
      });
      return;
    }
    
    // Navigate to the user profile page with the userId
    navigate(`/profile?userId=${userId}`);
  };

  return (
    <>
      <AdminHome />
      <div className="interview-reports-container">
        <div className="page-header">
          <h1 className="page-title">Interview & Application Reports</h1>
          <p className="text-muted">Manage and track company applicants and their interview status</p>
        </div>
        
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
            <span>{notification.message}</span>
          </div>
        )}
        
        {error ? (
          <div className="alert alert-danger" role="alert">
            <FaTimesCircle className="alert-icon" />
            {error}
          </div>
        ) : loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading applicant data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-container">
              <div className="stat-card company-card">
                <div className="stat-icon">
                  <FaBuilding />
                </div>
                <div className="stat-info">
                  <h2>{applicantData.length}</h2>
                  <p>Total Companies</p>
                </div>
              </div>
              
              <div className="stat-card applicant-card">
                <div className="stat-icon">
                  <FaUserGraduate />
                </div>
                <div className="stat-info">
                  <h2>{totalApplicants}</h2>
                  <p>Total Applicants</p>
                </div>
              </div>
              
              <div className="stat-card filtered-card">
                <div className="stat-icon">
                  <FaListAlt />
                </div>
                <div className="stat-info">
                  <h2>{filteredApplicants}</h2>
                  <p>Filtered Applicants</p>
                </div>
              </div>
            </div>

            {/* Filters Container */}
            <div className="filters-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by company or applicant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-box">
                <div className="dropdown">
                  <button className="filter-btn" onClick={() => document.getElementById('filterDropdown').classList.toggle('show')}>
                    <FaFilter className="filter-icon" /> Filter
                  </button>
                  <div id="filterDropdown" className="dropdown-content">
                    <select
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map((company, index) => (
                        <option key={index} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button className="filter-btn sort-btn" onClick={toggleSortOrder}>
                  {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                  {sortOrder === 'desc' ? 'Highest' : 'Lowest'} First
                </button>
                
                {(searchTerm || filterCompany) && (
                  <button className="filter-btn reset-btn" onClick={resetFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Company Cards */}
            {filteredData.length > 0 ? (
              <div className="company-cards-container">
                {filteredData.map((company, index) => {
                  // Use index as fallback if companyId is not available
                  const identifier = company.companyId || `index-${index}`;
                  
                  return (
                    <div key={index} className={`company-card ${activeCompany === identifier ? 'active' : ''}`}>
                      <div className="company-card-header" onClick={() => handleCompanyCardClick(identifier, index)}>
                        <div className="company-info">
                          <h3 className="company-name">
                            <FaBuilding className="company-icon" />
                            {company.companyName || 'Unnamed Company'}
                          </h3>
                          <div className="applicant-count">
                            <FaUserGraduate />
                            <span>{company.applicants.length} Applicants</span>
                          </div>
                        </div>
                        <div className="expand-indicator"></div>
                      </div>
                      
                      {activeCompany === identifier && (
                        <div className="company-card-body">
                          {company.applicants.length > 0 ? (
                            <div className="applicants-list">
                              <table className="applicants-table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {company.applicants.map((applicant, appIndex) => (
                                    <tr key={appIndex}>
                                      <td>{appIndex + 1}</td>
                                      <td>
                                        <div className="applicant-name">
                                          <FaUserAlt className="applicant-icon" />
                                          <span>{applicant.name}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="applicant-email">
                                          <FaEnvelope className="email-icon" />
                                          <span>{applicant.email}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="action-buttons">
                                          <button 
                                            className="action-btn view-btn"
                                            title="View Profile"
                                            onClick={() => viewProfile(applicant.userId)}
                                          >
                                            <FaEye /> Profile
                                          </button>
                                          <button 
                                            className="action-btn place-btn"
                                            title="Mark as Placed"
                                            onClick={() => updatePlacementStatus(applicant.userId, company.companyId, 'Placed')}
                                          >
                                            <FaCheckCircle /> Place
                                          </button>
                                          <button 
                                            className="action-btn unplace-btn"
                                            title="Mark as Unplaced"
                                            onClick={() => updatePlacementStatus(applicant.userId, company.companyId, 'Not Placed')}
                                          >
                                            <FaTimesCircle /> Unplace
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="no-applicants">
                              <p>No applicants for this company yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-results-container">
                <FaSearch className="no-results-icon" />
                <h3>No companies found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button className="reset-btn" onClick={resetFilters}>Clear All Filters</button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default InterviewReports; 