import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosConfig.js";
import { useNavigate, useParams } from "react-router-dom";
import AdminHome from "../AdminHomeComponents/AdminHome.js";
import Footer from "../AdminReusableComponents/AdminFooter.js";
import "../Admin-CSS/AdminNav.css";
import "./AddCompany.css";
import { 
  FaBuilding, FaBriefcase, FaUserGraduate, FaTimes,
  FaUpload, FaEdit
} from 'react-icons/fa';

function UpdateCompany() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Define fetchCompanyData using useCallback to avoid re-creating it on every render
  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/auth/getCompany/${id}`);
      const company = response.data;
      
      // Format the interview date for the date input (YYYY-MM-DD)
      let formattedDate = '';
      if (company.interviewDate) {
        const date = new Date(company.interviewDate);
        formattedDate = date.toISOString().split('T')[0];
      }
      
      setFormData({
        companyName: company.companyName || '',
        profile: company.profile || '',
        package: company.package || '',
        interviewDate: formattedDate,
        branch: company.branch || '',
        requiredSkills: company.requiredSkills || '',
        tenthPercentage: company.tenthPercentage || '',
        twelfthPercentage: company.twelfthPercentage || '',
        graduationCGPA: company.graduationCGPA || '',
        sixthSemesterCGPA: company.sixthSemesterCGPA || '',
        roles: company.roles || '',
        logoImage: null
      });
      
      // Set logo preview if available
      if (company.imageUrl) {
        setPreview(company.imageUrl);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setLoading(false);
      alert('Error loading company data. Please try again.');
    }
  }, [id]);

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
          // Fetch company data after authentication is confirmed
          fetchCompanyData();
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
  }, [navigate, id, fetchCompanyData]);

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
      setSaving(true);
      
      // Create form data for file upload
      const companyFormData = new FormData();
      companyFormData.append('companyName', formData.companyName);
      companyFormData.append('profile', formData.profile);
      companyFormData.append('package', formData.package);
      companyFormData.append('interviewDate', formData.interviewDate);
      companyFormData.append('branch', formData.branch);
      companyFormData.append('requiredSkills', formData.requiredSkills);
      companyFormData.append('tenthPercentage', formData.tenthPercentage);
      companyFormData.append('twelfthPercentage', formData.twelfthPercentage);
      companyFormData.append('graduationCGPA', formData.graduationCGPA);
      companyFormData.append('sixthSemesterCGPA', formData.sixthSemesterCGPA);
      companyFormData.append('roles', formData.roles);
      
      if (formData.logoImage) {
        companyFormData.append('logo', formData.logoImage);
      }
      
      // Send to server
      const response = await axios.put(`/auth/updateCompany/${id}`, companyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Company updated successfully:', response.data);
      
      // Redirect to company management
      navigate('/companycrud');
      
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Error updating company. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/companycrud');
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
            <h1>Update Company</h1>
            <p>Edit company details and requirements</p>
          </div>
          
          {loading ? (
            <div className="spinner-container">
              <div className="form-spinner"></div>
              <p>Loading company data...</p>
            </div>
          ) : (
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
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaEdit /> Update Company
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
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

export default UpdateCompany;
