import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosConfig.js";
import Footer from "../HomeComponents/Footer.js";
import scheduleimage from '../Assets/scheduleding.png';
import '../Home-CSS/Application.css';

function ScheduledInterview() {
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    axios
      .get(`/auth/currentUser?${userId ? 'userId=' + userId : 'email=' + userEmail}`)
      .then((res) => {
        setCurrentUser(res.data.user);
        console.log("User data loaded:", res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching current user:", err);
      });
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      const fetchScheduledInterviews = async () => {
        try {
          const userId = currentUser._id;

          const response = await axios.get(
            `/auth/scheduledInterviews/${userId}`
          );
          setScheduledInterviews(response.data.scheduledInterviews);
        } catch (error) {
          console.error(error);
        }
      };

      fetchScheduledInterviews();
    }
  }, [currentUser]);

  // Handle navigation functions
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="scheduled-interviews-page" style={{ minHeight: '100vh', overflowY: 'auto' }}>
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

      <div style={{ paddingTop: "120px", minHeight: "100vh", overflowY: "auto" }}>
        <h1 style={{ textAlign: "center", color: "navy", marginBottom: "40px" }}>
          Scheduled Interviews
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            padding: "20px",
          }}
        >
          <div
            style={{
              flex: "1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              marginBottom: "30px",
            }}
          >
            <img
              src={scheduleimage}
              alt="Scheduling"
              style={{
                maxWidth: "80%",
                maxHeight: "400px",
                borderRadius: "10px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>

          <div
            style={{
              flex: "1",
              overflowY: "auto",
              padding: "20px",
            }}
          >
            {scheduledInterviews.length > 0 ? (
              <ul
                style={{
                  listStyleType: "none",
                  padding: "0",
                  marginRight: "10px",
                }}
              >
                {scheduledInterviews.map((interview, index) => (
                  <li
                    key={index}
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderRadius: "5px",
                      padding: "15px",
                      marginBottom: "20px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <p style={{ margin: "0", fontSize: "1.6rem", color: "#333" }}>
                      <strong style={{ color: "#007bff" }}>Company:</strong>{" "}
                      {interview.companyName}
                    </p>
                    <p style={{ margin: "0", fontSize: "1.6rem", color: "#666" }}>
                      <strong style={{ color: "#007bff" }}>Interview Date:</strong>{" "}
                      {interview.interviewDate}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ fontSize: "1.4rem", color: "#666" }}>No scheduled interviews found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default ScheduledInterview;
