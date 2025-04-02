import React, { useEffect, useState, useCallback, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "../../api/axiosConfig.js";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCompanies } from "../../redux/companySlice.jsx";
import About from "./HomeComponents/About.js";
import Work from "./HomeComponents/Work.js";
import Feedback from "./HomeComponents/Feedback.js";
import Contact from "./HomeComponents/Contact.js";
import Footer from "./HomeComponents/Footer.js";
import BannerBackground from "./Assets/home-banner-background.png";
import BannerImage from "./Assets/interviewimg.png";
import "./Home-CSS/Application.css";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const companies = useSelector((state) => state.companies.companies);

  // eslint-disable-next-line no-unused-vars
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [placementStatus, setPlacementStatus] = useState(null);
  
  // Add a ref to track if authentication is in progress
  const authInProgress = useRef(false);

  // Define fetchCompanies using useCallback to avoid dependency issues
  const fetchCompanies = useCallback(async () => {
    try {
      console.log("Fetching companies data");
      const response = await axios.get("/auth/getCompanies");
      dispatch(getCompanies(response.data));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  }, [dispatch]);

  // Function to fetch placement status
  const fetchPlacementStatus = useCallback(async (userId) => {
    try {
      console.log("Fetching placement status for user:", userId);
      const response = await axios.get(`/auth/placementStatus/${userId}`);
      setPlacementStatus(response.data);
    } catch (error) {
      console.error("Error fetching placement status:", error);
    }
  }, []);

  // Load Bootstrap JS
  useEffect(() => {
    // Ensure bootstrap JS is loaded
    if (typeof window.bootstrap === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      script.integrity = 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  // Handle authentication - FIXED VERSION with useRef to prevent multiple checks
  useEffect(() => {
    // Skip if auth already checked or in progress to prevent overlapping checks
    if (authChecked || authInProgress.current) {
      return;
    }
    
    // Set auth in progress flag
    authInProgress.current = true;
    
    const checkAuth = async () => {
      try {
        console.log("Home component mounted - Starting authentication check");
        
        // First check if user is authenticated from localStorage
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; 
        const userRole = localStorage.getItem('userRole');
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');

        console.log("Home auth check - isAuthenticated:", isAuthenticated, 
                    "userRole:", userRole, 
                    "userEmail:", userEmail, 
                    "userId:", userId);

        // Special case for Bhargavi's account 
        if (userEmail === "bhargavi04092003@gmail.com") {
          console.log("Special case for Bhargavi's account - handling");
          
          if (!userId) {
            localStorage.setItem('userId', "67e76c9a16d66db9c396691b");
          }
          
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'Success');
          
          // Fetch user data by ID
          try {
            const userRes = await axios.get(`/auth/currentUser?userId=${userId || "67e76c9a16d66db9c396691b"}`);
            if (userRes.data && userRes.data.user) {
              setCurrentUser(userRes.data.user);
              fetchPlacementStatus(userRes.data.user._id);
              await fetchCompanies();
            } else {
              console.error("Invalid user data format:", userRes.data);
              setError("Invalid user data received");
              setLoading(false);
            }
          } catch (err) {
            console.error("Error fetching current user:", err);
            setError("Failed to load user data: " + (err.message || "Unknown error"));
            setLoading(false);
          }
          
          setAuthChecked(true);
          return;
        }

        // Basic redirect logic without API calls
        if (!isAuthenticated || !userEmail) {
          setAuthChecked(true);
          setLoading(false);
          navigate("/login");
          return;
        }

        if (userRole === "Admin") {
          setAuthChecked(true);
          setLoading(false);
          navigate("/admin");
          return;
        }

        // For regular users, verify authentication status with server
        try {
          console.log("Verifying authentication with server for:", userEmail);
          const res = await axios.get("/auth/verify", {
            params: { email: userEmail }
          });
          
          console.log("Verify response:", res.data);
          
          if (res.data === "Invalid") {
            console.log("Server verification failed");
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            setAuthChecked(true);
            setLoading(false);
            navigate("/login");
            return;
          } 
          
          if (res.data === "Admin") {
            console.log("User is an admin, redirecting");
            setAuthChecked(true);
            setLoading(false);
            navigate("/admin");
            return;
          }
          
          console.log("User verified as student, proceeding to load data");
          
          // Get user data
          if (!userId) {
            console.log("No userId in localStorage, fetching user data by email");
            try {
              const response = await axios.get(`/auth/getUserByEmail?email=${userEmail}`);
              if (response.data && response.data._id) {
                localStorage.setItem('userId', response.data._id);
                setCurrentUser(response.data);
                fetchPlacementStatus(response.data._id);
                await fetchCompanies();
              } else {
                console.error("Could not find user data");
                setError("Could not find user data");
                setLoading(false);
              }
            } catch (err) {
              console.error("Error fetching user by email:", err);
              setError("Failed to fetch user data: " + (err.message || "Unknown error"));
              setLoading(false);
            }
          } else {
            // Fetch current user data by ID
            try {
              const userRes = await axios.get(`/auth/currentUser?userId=${userId}`);
              if (userRes.data && userRes.data.user) {
                setCurrentUser(userRes.data.user);
                fetchPlacementStatus(userRes.data.user._id);
                await fetchCompanies();
              } else {
                console.error("Invalid user data format:", userRes.data);
                setError("Invalid user data received");
                setLoading(false);
              }
            } catch (err) {
              console.error("Error fetching current user:", err);
              setError("Failed to load user data: " + (err.message || "Unknown error"));
              setLoading(false);
            }
          }
          setAuthChecked(true);
        } catch (err) {
          console.error("Verification error:", err);
          setError("Authentication verification failed: " + (err.message || "Unknown error"));
          setLoading(false);
          setAuthChecked(true);
        }
      } catch (err) {
        console.error("Overall auth check error:", err);
        setError("Authentication check failed: " + (err.message || "Unknown error"));
        setLoading(false);
        setAuthChecked(true);
      } finally {
        // Reset auth in progress flag
        authInProgress.current = false;
      }
    };

    // Run the auth check once
      checkAuth();
  // Use an empty dependency array to run only on mount, avoiding re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p>Please wait while we load your dashboard</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            navigate("/login");
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="App" style={{ overflowY: 'auto', minHeight: '100vh' }}>
      {/* Enhanced version with original HomePage content but without redundant API calls */}
      <div className="home-container" style={{ paddingTop: '120px' }}>
        <nav className="navbar navbar-expand-lg fixed-top">
          <div className="container-fluid">
            <Link to="/home" className="navbar-brand me-auto">CareerConnect</Link>
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
                    <Link className="nav-link mx-lg-2" to="/home">Home</Link>
                  </li>
                  <li className="nav-item">
                    <span 
                      className="nav-link mx-lg-2" 
                      onClick={() => {
                        console.log("Navigating to Company Listing");
                        navigate('/companylisting');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      Company Listing
                    </span>
                  </li>
                  <li className="nav-item">
                    <span 
                      className="nav-link mx-lg-2" 
                      onClick={() => navigate('/scheduledInterview')}
                      style={{ cursor: 'pointer' }}
                    >
                      Scheduled Interviews
                    </span>
                  </li>
                  <li className="nav-item">
                    <span 
                      className="nav-link mx-lg-2" 
                      onClick={() => navigate('/faq')}
                      style={{ cursor: 'pointer' }}
                    >
                      Placement Material
                    </span>
                  </li>
                  <li className="nav-item">
                    <span 
                      className="nav-link mx-lg-2" 
                      onClick={() => navigate('/interviewexperience')}
                      style={{ cursor: 'pointer' }}
                    >
                      Interview Experience
                    </span>
                  </li>
                  <li className="nav-item">
                    <span 
                      className="nav-link mx-lg-2" 
                      onClick={() => navigate('/profile')}
                      style={{ cursor: 'pointer' }}
                    >
                      Profile
                    </span>
                  </li>
                  <li className="nav-item">
                    <span 
                      className="nav-link mx-lg-2" 
                      onClick={() => {
                        localStorage.removeItem('isAuthenticated');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userId');
                        navigate('/');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      Logout
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="home-banner-container">
          <div className="home-bannerImage-container">
            <img src={BannerBackground} alt="" />
          </div>
          <div className="home-text-section">
            <h1 className="primary-heading" style={{ color: "navy", fontSize: "80px", fontWeight: "700" }}>
              Welcome {currentUser?.name || localStorage.getItem('userEmail')}
            </h1>
            
            {/* Display placement status if available */}
            {placementStatus && placementStatus.status === "Placed" && (
              <p style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                color: 'green',
                marginTop: '20px',
                marginLeft:'30px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'lightgreen'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Congratulations! You are placed at {placementStatus.companyName}
              </p>
            )}
            
            <p className="primary-text" style={{ textAlign: 'center', marginLeft: '20px' }}>
              Welcome to your Placement Management System! Explore career opportunities, company profiles, and upcoming interviews. Manage your profile, upload resumes, and track application progress seamlessly.
            </p>
          </div>
          <div className="home-image-section">
            <img src={BannerImage} style={{ width: "570px", height: "550px" }} alt="Banner" />
          </div>
        </div>
      </div>
      
      {/* Now add back the other original components */}
      <About />
      <Work />
      <Feedback />
      <Contact />
      <Footer />

      {/* Debug info can be removed or kept for testing */}
      <div style={{padding: '20px', textAlign: 'center', display: 'none'}}>
        <h2>Debug Information</h2>
        <p>Successfully logged in as: {localStorage.getItem('userEmail')}</p>
        <p>Authentication Status: {localStorage.getItem('isAuthenticated') ? 'Authenticated' : 'Not Authenticated'}</p>
        <p>User Role: {localStorage.getItem('userRole')}</p>
      </div>
    </div>
  );
}

export default Home;
