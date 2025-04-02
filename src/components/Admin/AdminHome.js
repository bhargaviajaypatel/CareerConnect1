import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/actions/authActions';
import { FaChartBar, FaClipboardList, FaBuilding, FaBriefcase, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import './Admin-CSS/AdminNav.css';

const AdminHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('/');
  
  useEffect(() => {
    // Set active link based on current path
    const path = window.location.pathname;
    setActiveLink(path);
    
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'Admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  // Get first letter of user's name for avatar
  const getUserInitial = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.name ? user.name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admindashboard">
          CareerConnect Admin
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="adminNavbar"
          aria-labelledby="adminNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="adminNavbarLabel">
              Admin Menu
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          
          <div className="offcanvas-body">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className={`nav-item ${activeLink === '/admindashboard' ? 'active' : ''}`}>
                <Link 
                  className="nav-link" 
                  to="/admindashboard"
                  onClick={() => setActiveLink('/admindashboard')}
                >
                  <FaTachometerAlt className="nav-icon" />
                  Dashboard
                </Link>
              </li>
              
              <li className={`nav-item ${activeLink === '/scheduledInterviewdata' ? 'active' : ''}`}>
                <Link 
                  className="nav-link" 
                  to="/scheduledInterviewdata"
                  onClick={() => setActiveLink('/scheduledInterviewdata')}
                >
                  <FaClipboardList className="nav-icon" />
                  Reports
                </Link>
              </li>
              
              <li className={`nav-item ${activeLink === '/InterviewReports' ? 'active' : ''}`}>
                <Link 
                  className="nav-link" 
                  to="/InterviewReports"
                  onClick={() => setActiveLink('/InterviewReports')}
                >
                  <FaChartBar className="nav-icon" />
                  Interview Data
                </Link>
              </li>
              
              <li className={`nav-item ${activeLink === '/companycrud' ? 'active' : ''}`}>
                <Link 
                  className="nav-link" 
                  to="/companycrud"
                  onClick={() => setActiveLink('/companycrud')}
                >
                  <FaBuilding className="nav-icon" />
                  Companies
                </Link>
              </li>
              
              <li className={`nav-item ${activeLink === '/opportunities' ? 'active' : ''}`}>
                <Link 
                  className="nav-link" 
                  to="/opportunities"
                  onClick={() => setActiveLink('/opportunities')}
                >
                  <FaBriefcase className="nav-icon" />
                  Opportunities
                </Link>
              </li>
              
              <li className="nav-item">
                <Link className="nav-link profile-link" to="/profile">
                  <div className="profile-avatar">{getUserInitial()}</div>
                  Profile
                </Link>
              </li>
              
              <li className="nav-item">
                <button 
                  className="nav-link logout-link" 
                  onClick={handleLogout}
                  style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
                >
                  <FaSignOutAlt className="nav-icon" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHome;
