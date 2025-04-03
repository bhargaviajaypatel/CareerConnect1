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
import '../Home-CSS/CompanyModal.css';

function CompanyListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.companies.companies);

  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentGPA, setCurrentGPA] = useState(null);

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
        setCurrentGPA(res.data.user.sixthSemesterCGPA);
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

  // Show company details in modal
  const handleShowDetails = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
    
    // Ensure Bootstrap is loaded before trying to initialize the modal
    const initModal = () => {
      const modalElement = document.getElementById('companyDetailsModal');
      if (window.bootstrap && window.bootstrap.Modal) {
        const bsModal = new window.bootstrap.Modal(modalElement);
        bsModal.show();
      } else {
        // If Bootstrap is not yet loaded, try again after a short delay
        setTimeout(initModal, 100);
      }
    };
    
    initModal();
  };

  // Handle applying to a company
  const handleApply = async (companyId, userId) => {
    try {
      // get target company
      const company = companies.find((company) => company._id === companyId);
      
      // check if user has enough cgpa
      if (currentGPA < company.sixthSemesterCGPA) {
        alert("You do not have enough CGPA to apply to this company");
        return;
      }

      const response = await axios.post(
        `/auth/applyCompany/${userId}/${companyId}`
      );
      alert(response.data.message);

      const updatedResponse = await axios.get(
        `/auth/getCompanies/${companyId}`
      );
      dispatch(getCompanies(updatedResponse.data));
      navigate("/scheduledInterview");
    } catch (error) {
      console.error(error);
      alert("Error applying to company");
    }
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
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/placement-material')} style={{cursor: 'pointer'}}>Placement Material</span>
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
      <div className="company-content" style={{ paddingTop: "150px", minHeight: "100vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "3rem", color: "navy", marginBottom: "90px" }}>
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
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  margin: "10px",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  border: "1px solid #eaeaea",
                  position: "relative"
                }}
                onClick={() => handleShowDetails(company)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.08)";
                }}
              >
                <div style={{ 
                  height: "8px", 
                  backgroundColor: "#001f3f", 
                  width: "100%" 
                }}></div>
                <div style={{ padding: "25px 20px" }}>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      color: "#007bff",
                      marginBottom: "15px",
                      fontWeight: "600"
                    }}
                  >
                    {company.companyname}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#444",
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007bff" className="bi bi-briefcase-fill" viewBox="0 0 16 16" style={{ marginRight: "8px" }}>
                      <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
                    </svg>
                    <span><strong>Profile:</strong> {company.jobprofile}</span>
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#444",
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007bff" className="bi bi-cash-stack" viewBox="0 0 16 16" style={{ marginRight: "8px" }}>
                      <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                      <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
                    </svg>
                    <span><strong>CTC:</strong> {company.ctc} LPA</span>
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#444",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007bff" className="bi bi-calendar-event" viewBox="0 0 16 16" style={{ marginRight: "8px" }}>
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    <span><strong>Date:</strong> {company.doi}</span>
                  </p>
                </div>
                <div 
                  style={{ 
                    backgroundColor: "#f8f9fa", 
                    borderTop: "1px solid #eaeaea", 
                    padding: "15px", 
                    textAlign: "center"
                  }}
                >
                  <span
                    style={{
                      textDecoration: "none",
                      backgroundColor: "#001f3f",
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      display: "inline-block",
                      cursor: "pointer",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s ease, background-color 0.3s ease",
                      fontSize: "0.9rem",
                      fontWeight: "500"
                    }}
                    onMouseOver={(e) => {
                      e.stopPropagation(); // Stop event from bubbling to parent
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.backgroundColor = "#003366";
                    }}
                    onMouseOut={(e) => {
                      e.stopPropagation(); // Stop event from bubbling to parent
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.backgroundColor = "#001f3f";
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

      {/* Company Details Modal */}
      <div className="modal fade company-details-modal" id="companyDetailsModal" tabIndex="-1" aria-labelledby="companyDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="companyDetailsModalLabel">
                {selectedCompany && selectedCompany.companyname}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" style={{ filter: "brightness(0) invert(1)" }}></button>
            </div>
            <div className="modal-body">
              {selectedCompany && (
                <div className="company-details">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h4>Company Information</h4>
                      <p><strong>Company Name:</strong> {selectedCompany.companyname}</p>
                      <p><strong>Job Profile:</strong> {selectedCompany.jobprofile}</p>
                      <p><strong>CTC:</strong> {selectedCompany.ctc} LPA</p>
                      <p><strong>Interview Date:</strong> {selectedCompany.doi}</p>
                      {selectedCompany.website && (
                        <p><strong>Website:</strong> <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer">{selectedCompany.website}</a></p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h4>Eligibility Criteria</h4>
                      <p><strong>10th Percentage:</strong> {selectedCompany.tenthPercentage}%</p>
                      <p><strong>12th Percentage:</strong> {selectedCompany.twelfthPercentage}%</p>
                      <p><strong>Graduation CGPA:</strong> {selectedCompany.graduationCGPA}</p>
                      <p><strong>6th Semester CGPA:</strong> {selectedCompany.sixthSemesterCGPA}</p>
                      <p><strong>Branch Eligibility:</strong> {selectedCompany.eligibilityCriteria ? selectedCompany.eligibilityCriteria.join(", ") : "All branches eligible"}</p>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4>Job Description</h4>
                      <p style={{ whiteSpace: "pre-line" }}>{selectedCompany.jobdescription}</p>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4>Required Skills</h4>
                      <div>
                        {selectedCompany.requiredSkills && selectedCompany.requiredSkills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn close-btn" data-bs-dismiss="modal">Close</button>
              {selectedCompany && currentUser && (
                <button 
                  type="button" 
                  className="btn apply-btn" 
                  onClick={() => {
                    // Close the modal first
                    const modalInstance = window.bootstrap.Modal.getInstance(document.getElementById('companyDetailsModal'));
                    if (modalInstance) {
                      modalInstance.hide();
                    }
                    // Then apply
                    handleApply(selectedCompany._id, currentUser._id);
                  }}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default CompanyListing;
