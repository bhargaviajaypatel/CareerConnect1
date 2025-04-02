import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.js';
import AdminHome from '../AdminHomeComponents/AdminHome.js';
import Footer from '../AdminReusableComponents/AdminFooter.js';
import './AddCompany.css';
import { 
  FaBuilding, FaBriefcase, FaMoneyBillWave, FaCalendarAlt, 
  FaGraduationCap, FaUsers, FaUserGraduate, FaSave, FaTimes,
  FaUpload, FaChevronLeft, FaCode, FaPercentage
} from 'react-icons/fa';

function AddCompany() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  // Company data state
  const [formData, setFormData] = useState({
    companyName: '',
    profile: '',
    package: '',
    interviewDate: '',
    branch: '',
    requiredSkills: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    graduationCGPA: '',
    sixthSemesterCGPA: '',
    roles: '',
    logoImage: null
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logoImage: file
      });
      
      // Create preview for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create form data to match server expectations
      const companyData = {
        companyname: formData.companyName,
        jobprofile: formData.profile,
        jobdescription: formData.roles || "No description provided",
        website: "https://example.com", // Default value or add a field
        ctc: formData.package,
        doi: formData.interviewDate,
        eligibilityCriteria: [formData.branch],
        tenthPercentage: formData.tenthPercentage,
        twelfthPercentage: formData.twelfthPercentage,
        graduationCGPA: formData.graduationCGPA,
        sixthSemesterCGPA: formData.sixthSemesterCGPA,
        requiredSkills: formData.requiredSkills.split(',').map(skill => skill.trim()),
        rolesAndResponsibilities: formData.roles.split('\n').map(role => role.trim()).filter(role => role !== '')
      };
      
      // Send to server using the correct endpoint
      const response = await axios.post('/auth/add-companies', companyData);
      
      console.log('Company added successfully:', response.data);
      
      // Redirect to company management
      navigate('/companies');
      
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Error adding company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  // Get available branches for select input
  const branchOptions = [
    'BTECH-CS',
    'BTECH-IT',
    'BTECH-DATA SCIENCE',
    'MCA',
    'BTECH-ELECTRONICS'
  ];

  return (
    <>
      <AdminHome />
      {auth ? (
        <div className="company-form-container">
          <div className="form-header">
            <h1>Add New Company</h1>
            <p>Enter company details to create a new job opportunity</p>
          </div>
          
          <form className="company-form" onSubmit={handleSubmit}>
            {/* Company Basic Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon"><FaBuilding /></span>
                Company Information
              </h3>
              
              <div className="logo-upload">
                <div className="logo-preview">
                  {preview ? (
                    <img src={preview} alt="Company logo preview" />
                  ) : (
                    <FaBuilding className="upload-icon" />
                  )}
                </div>
                <div className="upload-info">
                  <h4>Company Logo</h4>
                  <p>Upload a square company logo or brand image (Optional)</p>
                  <div className="file-upload">
                    <label className="upload-btn">
                      <FaUpload style={{marginRight: '5px'}} /> Choose Image
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    className="form-control"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="profile">Job Profile *</label>
                  <input
                    type="text"
                    id="profile"
                    name="profile"
                    className="form-control"
                    value={formData.profile}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Software Engineer, Data Analyst"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="package">Package (LPA) *</label>
                  <input
                    type="number"
                    id="package"
                    name="package"
                    className="form-control"
                    value={formData.package}
                    onChange={handleInputChange}
                    required
                    placeholder="Annual package in lakhs"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="interviewDate">Interview Date *</label>
                  <input
                    type="date"
                    id="interviewDate"
                    name="interviewDate"
                    className="form-control"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Eligibility Requirements Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon"><FaUserGraduate /></span>
                Eligibility Requirements
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="branch">Eligible Branches *</label>
                  <select
                    id="branch"
                    name="branch"
                    className="form-control"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branchOptions.map((branch, index) => (
                      <option key={index} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="requiredSkills">Required Skills *</label>
                  <input
                    type="text"
                    id="requiredSkills"
                    name="requiredSkills"
                    className="form-control"
                    value={formData.requiredSkills}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Java, Python, Data Structures (comma separated)"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tenthPercentage">10th Percentage (Min) *</label>
                  <input
                    type="number"
                    id="tenthPercentage"
                    name="tenthPercentage"
                    className="form-control"
                    value={formData.tenthPercentage}
                    onChange={handleInputChange}
                    required
                    placeholder="Minimum 10th percentage"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="twelfthPercentage">12th Percentage (Min) *</label>
                  <input
                    type="number"
                    id="twelfthPercentage"
                    name="twelfthPercentage"
                    className="form-control"
                    value={formData.twelfthPercentage}
                    onChange={handleInputChange}
                    required
                    placeholder="Minimum 12th percentage"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="graduationCGPA">Graduation CGPA (Min) *</label>
                  <input
                    type="number"
                    id="graduationCGPA"
                    name="graduationCGPA"
                    className="form-control"
                    value={formData.graduationCGPA}
                    onChange={handleInputChange}
                    required
                    placeholder="Minimum graduation CGPA"
                    min="0"
                    max="10"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sixthSemesterCGPA">6th Semester CGPA (Min) *</label>
                  <input
                    type="number"
                    id="sixthSemesterCGPA"
                    name="sixthSemesterCGPA"
                    className="form-control"
                    value={formData.sixthSemesterCGPA}
                    onChange={handleInputChange}
                    required
                    placeholder="Minimum 6th semester CGPA"
                    min="0"
                    max="10"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            {/* Job Details Section */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon"><FaBriefcase /></span>
                Job Details
              </h3>
              
              <div className="form-group">
                <label htmlFor="roles">Roles & Responsibilities</label>
                <textarea
                  id="roles"
                  name="roles"
                  className="form-control"
                  value={formData.roles}
                  onChange={handleInputChange}
                  placeholder="Describe the roles and responsibilities for this position"
                  rows="5"
                ></textarea>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                <FaTimes /> Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Company
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="spinner-container">
          <div className="form-spinner"></div>
          <p>Verifying authentication...</p>
        </div>
      )}
      <Footer />
    </>
  );
}

export default AddCompany; 