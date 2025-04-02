import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "../../../api/axiosConfig.js";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCompanies } from "../../../redux/companySlice.jsx";
import Footer from "../HomeComponents/Footer.js";
// Custom navbar without Link components to avoid navigation issues
import '../Home-CSS/AdminNav.css';
import '../Home-CSS/Application.css';

function CompanyListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.companies.companies);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log("CompanyListing component mounted");
    
    // Get the userId or email from localStorage
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated || !userEmail) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    
    // Skip the verify check that might be causing redirection
    // Just fetch the user data directly
    axios
      .get(`/auth/currentUser?${userId ? 'userId=' + userId : 'email=' + userEmail}`)
      .then((res) => {
        setCurrentUser(res.data.user);
        console.log("User data loaded:", res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching current user:", err);
      });
      
    // Fetch companies data
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      console.log("Fetching companies data in CompanyListing");
      const response = await axios.get("/auth/getCompanies");
      dispatch(getCompanies(response.data));
      console.log("Companies data loaded:", response.data);
    } catch (err) {
      console.log("Error fetching companies:", err);
    }
  };

  // Handle navigation functions
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="companies-page">
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
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/interviewexperience')} style={{cursor: 'pointer'}}>Interview Experience</span>
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

      {/* Main content - with padding for scrolling */}
      <div className="company-content" style={{ paddingTop: "120px", minHeight: "100vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "3rem", color: "navy" }}>
            Ongoing Drives
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap", // Allow cards to wrap onto multiple lines
              gap: "20px", // Gap between cards
              padding: "20px", // Add padding around the cards
            }}
          >
            {companies.map((company) => (
              <div
                key={company.id}
                style={{
                  width: "300px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  margin: "10px", // Add margin to separate cards
                  overflow: "hidden", // Hide overflowing content
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for cards
                }}
              >
                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      color: "#007bff",
                      marginBottom: "10px",
                    }}
                  >
                    {company.companyname}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    Profile: {company.jobprofile}
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    CTC: {company.ctc} LPA
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    Interview Date: {company.doi}
                  </p>
                </div>
                <div style={{ textAlign: "center", paddingBottom: "20px" }}>
                  <span
                    onClick={() => handleNavigation(`/companypage/${company.id}`)}
                    style={{
                      textDecoration: "none",
                      backgroundColor: "#001f3f", // Navy blue background color
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      display: "inline-block",
                      cursor: "pointer",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Box shadow for button
                      transition: "transform 0.3s ease", // Animation for button
                    }}
                  >
                    Show Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default CompanyListing;
