import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.js';
import AdminHome from '../AdminHomeComponents/AdminHome.js';
import Footer from '../AdminReusableComponents/AdminFooter.js';
import { FaBuilding, FaSearch, FaPlus, FaEdit, FaTrashAlt, FaEye, FaBriefcase, FaMoneyBillWave, FaCalendarAlt, FaGraduationCap, FaThList, FaTh } from 'react-icons/fa';
import './Companycrud.css';

function Companycrud() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'table'
  const [auth, setAuth] = useState(false);
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
    // Authentication check code
    console.log("Authentication check started...");
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log("Auth status:", { isAuthenticated, userRole, userEmail });
    
    if (!isAuthenticated || userRole !== 'Admin') {
      console.log('Access denied: User is not authenticated as admin');
      navigate('/login');
      return;
    }

    // Verify authentication on server
    console.log("Making server authentication request...");
    axios.get('/auth/verify', {
      params: { email: userEmail },
      headers: { 'user-email': userEmail }
    })
      .then(response => {
        console.log("Auth verification response:", response.data);
        if (response.data === 'Admin') {
          console.log('Admin authentication verified, will fetch companies now');
          setAuth(true);
          fetchCompanies();
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

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('Fetching companies from API...');
      const response = await axios.get('/auth/getCompanies');
      console.log('API Response:', response);
      console.log('Response structure:', JSON.stringify(response.data, null, 2));
      
      // Extract companies from the data property in the response
      const companiesData = response.data.data || [];
      console.log('Extracted companies data:', companiesData);
      console.log('First company (if any):', companiesData.length > 0 ? companiesData[0] : 'No companies found');
      
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        // The API endpoint is deletecompany (lowercase) not deleteCompany
        await axios.delete(`/auth/deletecompany/${id}`);
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  // Filter companies based on search term
  const filteredCompanies = Array.isArray(companies) 
    ? companies.filter(company => 
        (company.companyname || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (company.jobprofile || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Parse skills from required skills array
  const parseSkills = (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) return [];
    return skillsArray;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <>
      <AdminHome />
      {auth ? (
        <div className="company-container">
          {/* Page Header */}
          <div className="company-header">
            <h1>Companies Management</h1>
            <p>Add, edit, and manage company opportunities for students</p>
          </div>

          {/* Action Bar */}
          <div className="action-container">
            <Link to="/addcompany" className="add-button">
              <FaPlus className="add-icon" /> Add Company
            </Link>
            
            <div className="d-flex gap-3 align-items-center">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search companies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${view === 'grid' ? 'active' : ''}`} 
                  onClick={() => setView('grid')}
                >
                  <FaTh />
                </button>
                <button 
                  className={`toggle-btn ${view === 'table' ? 'active' : ''}`} 
                  onClick={() => setView('table')}
                >
                  <FaThList />
                </button>
              </div>
            </div>
          </div>

          {/* Companies Display */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading companies...</p>
            </div>
          ) : filteredCompanies.length > 0 ? (
            view === 'grid' ? (
              // Grid View
              <div className="companies-grid">
                {filteredCompanies.map(company => (
                  <div key={company._id} className="company-card">
                    <div className="company-banner"></div>
                    <div className="company-logo">
                      {company.imageUrl ? (
                        <img src={company.imageUrl} alt="Company logo" />
                      ) : (
                        <FaBuilding size={32} color="#4a90e2" />
                      )}
                    </div>
                    <div className="company-info">
                      <h3 className="company-name">{company.companyname}</h3>
                      <p className="company-role">{company.jobprofile}</p>
                      
                      <div className="company-detail">
                        <FaMoneyBillWave className="detail-icon" />
                        <span>Package: {company.ctc} LPA</span>
                      </div>
                      
                      <div className="company-detail">
                        <FaCalendarAlt className="detail-icon" />
                        <span>Interview: {formatDate(company.doi)}</span>
                      </div>
                      
                      <div className="company-detail">
                        <FaGraduationCap className="detail-icon" />
                        <span>Branch: {Array.isArray(company.eligibilityCriteria) ? company.eligibilityCriteria.join(', ') : company.eligibilityCriteria}</span>
                      </div>
                      
                      <div className="skills-container">
                        {parseSkills(company.requiredSkills).slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                        {parseSkills(company.requiredSkills).length > 3 && (
                          <span className="skill-tag">+{parseSkills(company.requiredSkills).length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div className="company-actions">
                      <button className="card-action-btn view-btn" title="View Details">
                        <FaEye />
                      </button>
                      <Link to={`/updatecompany/${company._id}`}>
                        <button className="card-action-btn edit-btn" title="Edit Company">
                          <FaEdit />
                        </button>
                      </Link>
                      <button 
                        className="card-action-btn delete-btn" 
                        title="Delete Company"
                        onClick={() => handleDelete(company._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Table View
              <div className="companies-table-container">
                <table className="companies-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Profile</th>
                      <th>Package</th>
                      <th>Interview Date</th>
                      <th>Branch</th>
                      <th>Required Skills</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map(company => (
                      <tr key={company._id} className="table-row">
                        <td>
                          <div className="cell-with-icon">
                            <span className="company-icon"><FaBuilding /></span>
                            <span>{company.companyname}</span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-with-icon">
                            <span className="company-icon"><FaBriefcase /></span>
                            <span>{company.jobprofile}</span>
                          </div>
                        </td>
                        <td>{company.ctc} LPA</td>
                        <td>{formatDate(company.doi)}</td>
                        <td>{Array.isArray(company.eligibilityCriteria) ? company.eligibilityCriteria.join(', ') : company.eligibilityCriteria}</td>
                        <td>
                          <div className="skills-container">
                            {parseSkills(company.requiredSkills).slice(0, 2).map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                            {parseSkills(company.requiredSkills).length > 2 && (
                              <span className="skill-tag">+{parseSkills(company.requiredSkills).length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button className="table-action-btn view-btn" title="View Details">
                            <FaEye />
                          </button>
                          <Link to={`/updatecompany/${company._id}`}>
                            <button className="table-action-btn edit-btn" title="Edit Company">
                              <FaEdit />
                            </button>
                          </Link>
                          <button 
                            className="table-action-btn delete-btn" 
                            title="Delete Company"
                            onClick={() => handleDelete(company._id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <h3>No companies found</h3>
              <p>Try adjusting your search or add a new company</p>
              <Link to="/addcompany" className="add-button mt-3">
                <FaPlus className="add-icon" /> Add Company
              </Link>
            </div>
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

export default Companycrud;
