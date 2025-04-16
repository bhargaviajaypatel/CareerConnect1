import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCompanies } from '../../redux/companySlice';
import axiosInstance from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

// Import CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home-CSS/NewModernHome.css";

// Import components
import Navbar from "./HomeComponents/Navbar.js";
import Footer from "./HomeComponents/Footer.js";

// College name and logo configuration
const COLLEGE_INFO = {
  name: "Tech Institute of Engineering",
  logo: "https://via.placeholder.com/150x150/4b2e83/ffffff?text=TIE",
  establishedYear: "1985",
  campusLocation: "Main Campus",
  department: "Department of Computer Science & Engineering"
};

// Company logo imports - Using placeholder images for simplicity
const COMPANY_LOGOS = {
  "Google": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
  "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
  "Amazon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
  "Apple": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png",
  "Meta": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png",
  "Netflix": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png",
  "IBM": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1200px-IBM_logo.svg.png",
  "Oracle": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/1200px-Oracle_logo.svg.png"
};

const NewHome = () => {
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const email = localStorage.getItem('userEmail');
        if (email) {
          const profileResponse = await axiosInstance.get(`/profile/${email}`);
          if (profileResponse.data.status) {
            setUserProfile(profileResponse.data.user);
          }
        }

        // Fetch companies
        const companiesResponse = await axiosInstance.get('/auth/getCompanies');
        if (companiesResponse.data.status) {
          const companies = companiesResponse.data.companies || [];
          setFeaturedCompanies(companies);
          dispatch(getCompanies(companies));
        }

        // Fetch statistics
        const statsResponse = await axiosInstance.get('/api/statistics/placements');
        if (statsResponse.data.status) {
          setStatistics(statsResponse.data.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <h3>Loading Career Connect...</h3>
      </div>
    );
  }

  return (
    <div className="modern-home-container">
      {/* Navbar */}
      <Navbar />

      <div className="content-wrapper">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background"></div>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8 col-md-12 hero-content slide-left">
                <h1 className="hero-title">
                  Career Connect
                </h1>
                <div className="welcome-message">
                  {userProfile ? (
                    <>
                      <h2>Hello, <span className="user-name">{userProfile.name}</span>! <span className="wave-emoji">👋</span></h2>
                      <p className="welcome-tagline">Ready to shape your future career journey at {COLLEGE_INFO.name}?</p>
                    </>
                  ) : (
                    <>
                      <h2>Welcome to Career Connect</h2>
                      <p className="welcome-tagline">Please log in to access your personalized dashboard</p>
                    </>
                  )}
                </div>
                <p className="hero-description">
                  Your one-stop platform for campus recruitment opportunities, interview preparation resources, and networking with industry professionals.
                </p>
              </div>
              <div className="col-lg-4 col-md-12 d-none d-lg-block slide-right">
                <div className="hero-image-container">
                  <img
                    src="https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg"
                    alt="College students"
                    className="hero-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* College Announcements Section */}
        <section className="announcements-section py-5">
          <div className="container">
            <div className="section-header text-center mb-5">
              <h2>Campus Announcements</h2>
              <p>Stay updated with the latest placement activities</p>
            </div>
            
            <div className="row">
              {/* Add announcements here */}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="section-header text-center mb-5">
              <h2>Placement Statistics</h2>
              <p>{COLLEGE_INFO.name} placement achievements</p>
            </div>
            
            <div className="row justify-content-center">
              {/* First stat */}
              <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="stat-content">
                    <h3><span className="counter">{statistics && statistics.totalPlacements}</span>+</h3>
                    <p>Students Placed</p>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{width: '85%'}}></div>
                    </div>
                    <span className="trend-indicator positive">
                      <i className="fas fa-arrow-up"></i> 12% increase
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Second stat */}
              <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                  <div className="stat-content">
                    <h3><span className="counter">{statistics && statistics.averageCTC}</span> LPA</h3>
                    <p>Average Package</p>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{width: '75%'}}></div>
                    </div>
                    <span className="trend-indicator positive">
                      <i className="fas fa-arrow-up"></i> 7% increase
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Third stat */}
              <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-medal"></i>
                  </div>
                  <div className="stat-content">
                    <h3><span className="counter">{statistics && statistics.successRate}%</span></h3>
                    <p>Success Rate</p>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{width: '94%'}}></div>
                    </div>
                    <span className="trend-indicator positive">
                      <i className="fas fa-arrow-up"></i> 5% increase
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Fourth stat */}
              <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="stat-content">
                    <h3><span className="counter">50+</span></h3>
                    <p>Campus Recruiters</p>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{width: '80%'}}></div>
                    </div>
                    <span className="trend-indicator positive">
                      <i className="fas fa-arrow-up"></i> 15% increase
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add curved divider */}
          <div className="section-divider divider-gray">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
            </svg>
          </div>
        </section>

        {/* Featured Companies Section */}
        <section className="featured-companies-section">
          <div className="container">
            <div className="section-header text-center mb-5">
              <h2>Campus Recruiters</h2>
              <p>Top organizations that recruit from {COLLEGE_INFO.name}</p>
            </div>
            
            <div className="row justify-content-center">
              {featuredCompanies && featuredCompanies.length > 0 ? (
                featuredCompanies.map((company, index) => (
                  <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={company.id || index}>
                    <div className="company-logo-container">
                      <img 
                        src={company.logo || `https://via.placeholder.com/150x80/eaeefd/3a57e8?text=${company.name}`} 
                        alt={`${company.name} logo`}
                        className="company-logo-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x80/eaeefd/3a57e8?text=Company+Logo';
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">No featured companies found</div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default NewHome;
