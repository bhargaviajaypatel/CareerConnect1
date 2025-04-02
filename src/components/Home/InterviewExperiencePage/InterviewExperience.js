import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.js';
import sanitizeHtml from 'sanitize-html';
import '../Home-CSS/Application.css';
import '../Home-CSS/interview-experience.css';
import Footer from "../HomeComponents/Footer.js";

function InterviewExperience() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  
  // Stats calculation
  const getInterviewStats = () => {
    if (!interviews.length) return { total: 0, easy: 0, medium: 0, hard: 0, success: 0 };
    
    return {
      total: interviews.length,
      easy: interviews.filter(i => i.interviewLevel?.toLowerCase() === 'easy').length,
      medium: interviews.filter(i => i.interviewLevel?.toLowerCase() === 'medium').length,
      hard: interviews.filter(i => i.interviewLevel?.toLowerCase() === 'hard' || i.interviewLevel?.toLowerCase() === 'difficult').length,
      success: interviews.filter(i => i.result === 'Successful').length,
    };
  };
  
  // Handle navigation functions
  const handleNavigation = (path) => {
    navigate(path);
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/fetchinterviewexperience');
      setInterviews(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interview experiences:', error);
      setLoading(false);
    }
  };

  // Authentication check
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated || !userEmail) {
      navigate("/login");
      return;
    }
    
    fetchInterviews();
  }, [navigate]);

  const sanitizeContent = (content) => {
    return sanitizeHtml(content, {
      allowedTags: ['p', 'br', 'b', 'i', 'u', 'em', 'strong'],
      allowedAttributes: {},
    });
  };
  
  // Filter interviews based on search term and filters
  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = 
      (interview.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.username?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = 
      filterDifficulty === 'all' || 
      interview.interviewLevel?.toLowerCase() === filterDifficulty;
    
    const matchesResult = 
      filterResult === 'all' || 
      interview.result === filterResult;
    
    return matchesSearch && matchesDifficulty && matchesResult;
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('all');
    setFilterResult('all');
  };
  
  const stats = getInterviewStats();
  
  // Get difficulty badge class
  const getDifficultyClass = (level) => {
    if (!level) return '';
    
    level = level.toLowerCase();
    if (level === 'easy') return 'easy';
    if (level === 'hard' || level === 'difficult') return 'hard';
    return '';
  };
  
  // Get result badge class
  const getResultClass = (result) => {
    if (!result) return '';
    
    result = result.toLowerCase();
    if (result === 'successful') return 'successful';
    if (result === 'rejected') return 'rejected';
    if (result === 'waiting') return 'waiting';
    return '';
  };

  return (
    <div>
      {/* Custom navbar without Link components to avoid navigation issues */}
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand me-auto" onClick={() => handleNavigation('/home')} style={{cursor: 'pointer'}}>CareerConnect</span>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Career Connect</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/home')} style={{cursor: 'pointer'}}>Home</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/companylisting')} style={{cursor: 'pointer'}}>Company Listing</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/scheduledInterview')} style={{cursor: 'pointer'}}>Scheduled Interviews</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/faq')} style={{cursor: 'pointer'}}>Placement Material</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2 active" onClick={() => handleNavigation('/interviewexperience')} style={{cursor: 'pointer'}}>Interview Experience</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/profile')} style={{cursor: 'pointer'}}>Profile</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userId');
                    handleNavigation('/');
                  }} style={{cursor: 'pointer'}}>Logout</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Interview Experience Page */}
      <div className="interview-experience-page">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Stats Cards */}
          <div className="stats-cards-container">
            {/* Total Interviews Card */}
            <div className="stat-card stat-card-purple">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Interviews</div>
            </div>
            
            {/* Success Rate Card */}
            <div className="stat-card stat-card-green">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-number">{stats.success}</div>
              <div className="stat-label">Successful</div>
            </div>
            
            {/* Medium Difficulty Card */}
            <div className="stat-card stat-card-orange">
              <div className="stat-icon">
                <i className="fas fa-adjust"></i>
              </div>
              <div className="stat-number">{stats.medium}</div>
              <div className="stat-label">Medium Difficulty</div>
            </div>
            
            {/* Hard Difficulty Card */}
            <div className="stat-card stat-card-red">
              <div className="stat-icon">
                <i className="fas fa-fire"></i>
              </div>
              <div className="stat-number">{stats.hard}</div>
              <div className="stat-label">Hard Difficulty</div>
            </div>
          </div>
          
          {/* Filters Area */}
          <div className="filters-container">
            {/* Filter by Result */}
            <div className="filter-dropdown">
              <label className="filter-label">Filter by Result:</label>
              <select 
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Results</option>
                <option value="Successful">Successful</option>
                <option value="Rejected">Rejected</option>
                <option value="Waiting">Waiting</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={resetFilters} className="action-btn reset-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                </svg>
                Reset
              </button>
              
              <button onClick={() => handleNavigation('/addexperience')} className="action-btn add-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add Interview
              </button>
              
              <button className="action-btn apply-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                </svg>
                Apply Filters
              </button>
              
              <button className="action-btn download-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Download Report
              </button>
            </div>
          </div>
          
          {/* Interview Cards */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading interview experiences...</div>
            </div>
          ) : filteredInterviews.length > 0 ? (
            <div className="interview-cards-grid">
              {filteredInterviews.map((interview) => (
                <div key={interview._id} className="interview-card">
                  <div className="interview-card-header">
                    <div className="interview-card-company">
                      <i className="fas fa-building"></i>
                      {interview.companyName}
                    </div>
                    <div className="interview-card-position">
                      {interview.position}
                    </div>
                    <div className="interview-card-badges">
                      <span className={`interview-card-badge badge-difficulty ${getDifficultyClass(interview.interviewLevel)}`}>
                        {interview.interviewLevel}
                      </span>
                      <span className={`interview-card-badge badge-result ${getResultClass(interview.result)}`}>
                        {interview.result}
                      </span>
                    </div>
                  </div>
                  <div className="interview-card-content"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeContent(interview.experience).length > 150 
                        ? sanitizeContent(interview.experience).substring(0, 150) + '...' 
                        : sanitizeContent(interview.experience) 
                    }} 
                  />
                  <div className="interview-card-footer">
                    <div className="interview-card-author">
                      Posted by: {interview.username}
                    </div>
                    <div className="interview-card-date">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="empty-state-title">No interview experiences found</h3>
              <p className="empty-state-message">
                We couldn't find any interview experiences matching your search criteria. 
                Try adjusting your filters or be the first to share your experience!
              </p>
              <button 
                onClick={() => handleNavigation('/addexperience')} 
                className="empty-state-action"
              >
                Share Your Experience
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default InterviewExperience;
