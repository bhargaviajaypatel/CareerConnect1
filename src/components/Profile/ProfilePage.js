import { useState, useEffect, useRef, useContext } from "react";
import axios from "../../api/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../App.js";
import "./Profile-CSS/ProfilePage.css";
import "./Profile-CSS/RoadmapStyles.css";
import "../Home/Home-CSS/Application.css";

function ProfilePage() {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState(null);
  const [tempEditValue, setTempEditValue] = useState("");
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [documentUploadLoading, setDocumentUploadLoading] = useState(false);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [savedRoadmapsLoading, setSavedRoadmapsLoading] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAndFetchProfile = async () => {
      try {
        // Get the userId or email from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (!isAuthenticated || !userEmail) {
          console.log("Not authenticated, redirecting to login");
          navigate("/login");
          return;
        }
        
        await fetchProfileData();
        await fetchDocuments();
      } catch (err) {
        console.error("Authentication error:", err);
        setError({
          type: 'error',
          message: "Authentication failed. Please login again."
        });
        setLoading(false);
        navigate("/");
      }
    };
    verifyAndFetchProfile();
  }, [navigate]);

  useEffect(() => {
    // Calculate profile completion percentage
    if (profileData && Object.keys(profileData).length > 0) {
      calculateCompletionPercentage();
    }
  }, [profileData]);

  const calculateCompletionPercentage = () => {
    const requiredFields = [
      'name', 'email', 'contactNumber', 'gender', 'dob', 
      'prn', 'rollNo', 'stream', 'tenthPercentage', 'twelfthPercentage'
    ];
    
    const optionalFields = [
      'resume', 'careerPreferences', 'savedRoadmaps', 'skills', 
      'projects', 'internships', 'achievements', 'certifications'
    ];
    
    let completedRequired = 0;
    let completedOptional = 0;
    
    requiredFields.forEach(field => {
      if (profileData[field]) completedRequired++;
    });
    
    optionalFields.forEach(field => {
      if (profileData[field]) {
        if (typeof profileData[field] === 'object') {
          if (Array.isArray(profileData[field])) {
            if (profileData[field].length > 0) completedOptional++;
          } else if (Object.keys(profileData[field]).length > 0) {
            completedOptional++;
          }
        } else if (profileData[field]) {
          completedOptional++;
        }
      }
    });
    
    const requiredPercentage = (completedRequired / requiredFields.length) * 70;
    const optionalPercentage = (completedOptional / optionalFields.length) * 30;
    
    setCompletionPercentage(Math.round(requiredPercentage + optionalPercentage));
  };

  const fetchProfileData = async () => {
    try {
      // Get the userId from localStorage
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        console.error("No userId found in localStorage");
        setError("User ID not found. Please log in again.");
        navigate("/");
        return;
      }
      
      const response = await axios.get(`/auth/profile?userId=${userId}`);
      if (response.data && response.data.user) {
        setProfileData(response.data.user);
        setError(null);
      } else {
        setError("Invalid profile data format");
      }
    } catch (err) {
      setError("Failed to load profile data. Please try again later.");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate("/editprofilepage");
  };

  const navigateToRoadmap = (roadmapId) => {
    navigate(`/placement-material?roadmap=${roadmapId}`);
  };
  
  const startEditing = (field, value) => {
    setIsEditing(true);
    setEditField(field);
    setTempEditValue(value || '');
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditField(null);
    setTempEditValue("");
  };
  
  const saveEdit = async (field) => {
    try {
      // Validation for specific fields
      if (field === 'contactNumber' && !/^\d{10}$/.test(tempEditValue)) {
        setError({
          type: 'error',
          message: "Please enter a valid 10-digit phone number"
        });
        return;
      }
      
      // Create a deep copy of profileData
      const updatedProfile = JSON.parse(JSON.stringify(profileData));
      
      // Update the specific field
      if (field.includes('.')) {
        // Handle nested fields (like careerPreferences.careerGoals)
        const [parent, child] = field.split('.');
        if (!updatedProfile[parent]) updatedProfile[parent] = {};
        updatedProfile[parent][child] = tempEditValue;
      } else {
        updatedProfile[field] = tempEditValue;
      }
      
      // Send to server
      await axios.post("/auth/updateProfile", { 
        field, 
        value: tempEditValue 
      });
      
      // Update local state
      setProfileData(updatedProfile);
      setIsEditing(false);
      setEditField(null);
      setTempEditValue("");
      
      // Show success notification
      setError({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError({
        type: 'error',
        message: "Failed to update profile. Please try again."
      });
    }
  };
  
  // Function to handle keypress events for inline editing
  const handleEditKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      saveEdit(field);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };
  
  const handleProfilePictureUpload = () => {
    fileInputRef.current.click();
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await axios.post('/auth/uploadProfilePicture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        // Update profileData with new profile picture URL
        setProfileData({
          ...profileData,
          profilePicture: response.data.profilePictureUrl
        });
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("Failed to upload profile picture. Please try again.");
    }
  };
  
  const generateResumePDF = async () => {
    try {
      setError({ type: 'info', message: 'Generating resume, please wait...' });
      
      // First, check if the user has a resume uploaded
      if (!profileData.resume) {
        setError({ 
          type: 'error', 
          message: "You don't have a resume uploaded. Please upload a resume first."
        });
        return;
      }
      
      const response = await axios.get('/auth/generateResume', {
        responseType: 'blob'
      });
      
      // Check if we received a proper PDF response
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/pdf')) {
        // Create a URL for the blob and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        
        // Open PDF in a new tab for preview instead of immediate download
        window.open(url, '_blank');
        
        // Clean up the URL object after opening
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
        setError({ 
          type: 'success', 
          message: 'Resume preview opened in a new tab!'
        });
      } else {
        // If we didn't get a PDF, show error
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error("Error generating resume:", err);
      setError({
        type: 'error',
        message: "Failed to generate resume. Please try again later."
      });
    }
    
    // Clear success/info messages after 3 seconds
    setTimeout(() => {
      setError(prev => prev && prev.type !== 'error' ? null : prev);
    }, 3000);
  };

  // Document management functions
  const fetchDocuments = async () => {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }
      
      const response = await axios.get(`/auth/documents?userId=${userId}`);
      if (response.data && response.data.documents) {
        setDocuments(response.data.documents);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      // Don't set error since this is not critical functionality
    }
  };

  // State for drag-drop enhancements
  const [isDragging, setIsDragging] = useState(false);
  const [documentFilter, setDocumentFilter] = useState('all');
  const [documentSort, setDocumentSort] = useState('newest');
  
  // Handle drag events with visual feedback
  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  // Enhanced file drop handler for multiple files
  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Handle multiple files
      Array.from(files).forEach(file => {
        const formData = new FormData();
        formData.append('document', file);
        uploadDocumentWithFormData(formData);
      });
    }
  };

  // Add the function to handle document upload with FormData
  const uploadDocumentWithFormData = async (formData) => {
    try {
      setDocumentUploadLoading(true);
      
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError({
          type: 'error',
          message: 'User ID not found. Please log in again.'
        });
        return;
      }
      
      const response = await axios.post(`/auth/documents/upload?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.document) {
        setDocuments(prev => [...prev, response.data.document]);
        setError({
          type: 'success',
          message: 'Document uploaded successfully!'
        });
        
        // Refresh profile data to get the updated documents
        fetchProfileData();
        fetchDocuments();
        
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setError({
        type: 'error',
        message: 'Failed to upload document. Please try again.'
      });
    } finally {
      setDocumentUploadLoading(false);
    }
  };

  const uploadDocument = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setDocumentUploadLoading(true);
      
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError({
          type: 'error',
          message: 'User ID not found. Please log in again.'
        });
        return;
      }
      
      // Handle multiple files
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('document', files[i]);
        
        const response = await axios.post(`/auth/documents/upload?userId=${userId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data && response.data.document) {
          // Add new document to state
          setDocuments(prev => [...prev, response.data.document]);
        }
      }
      
      // Refresh profile data to get the updated documents
      fetchProfileData();
      fetchDocuments();
      
      // Show success message
      setError({
        type: 'success',
        message: `${files.length > 1 ? files.length + ' documents' : 'Document'} uploaded successfully!`
      });
      
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error uploading document:", err);
      setError({
        type: 'error',
        message: 'Failed to upload document. Please try again.'
      });
    } finally {
      setDocumentUploadLoading(false);
    }
  };

  // Filter and sort documents
  const getFilteredAndSortedDocuments = () => {
    // First filter by search query
    let filtered = documents.filter(doc => 
      doc.filename.toLowerCase().includes(documentSearchQuery.toLowerCase())
    );
    
    // Then filter by document type
    if (documentFilter !== 'all') {
      filtered = filtered.filter(doc => {
        switch(documentFilter) {
          case 'pdf':
            return doc.contentType.includes('pdf');
          case 'word':
            return doc.contentType.includes('word') || doc.contentType.includes('document');
          case 'spreadsheet':
            return doc.contentType.includes('sheet') || doc.contentType.includes('excel');
          case 'presentation':
            return doc.contentType.includes('presentation') || doc.contentType.includes('powerpoint');
          case 'image':
            return doc.contentType.includes('image');
          default:
            return true;
        }
      });
    }
    
    // Finally sort
    return filtered.sort((a, b) => {
      switch(documentSort) {
        case 'newest':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'oldest':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'name-asc':
          return a.filename.localeCompare(b.filename);
        case 'name-desc':
          return b.filename.localeCompare(a.filename);
        default:
          return 0;
      }
    });
  };

  const deleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await axios.delete(`/auth/documents/${documentId}`);
        if (response.data && response.data.success) {
          // Remove document from state
          setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          // Show success message
          setError({
            type: 'success',
            message: 'Document deleted successfully!'
          });
          
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        console.error("Error deleting document:", err);
        setError({
          type: 'error',
          message: 'Failed to delete document. Please try again.'
        });
      }
    }
  };

  // Fetch roadmap progress for all saved roadmaps
  const fetchRoadmapProgress = async () => {
    if (!profileData.savedRoadmaps || profileData.savedRoadmaps.length === 0) return;
    
    try {
      setSavedRoadmapsLoading(true);
      const response = await axios.get("/roadmap/progress");
      
      if (response.data && response.data.progress) {
        // Convert array to object with roadmapId as key for easier access
        const progressMap = {};
        response.data.progress.forEach(item => {
          // Add more detailed tracking information
          progressMap[item.roadmapId] = {
            completedCount: item.completedResources.length,
            totalCount: item.totalResources,
            percentage: item.totalResources > 0 
              ? Math.round((item.completedResources.length / item.totalResources) * 100) 
              : 0,
            completedResources: item.completedResources,
            lastUpdated: item.lastUpdated || null,
            // Calculate estimated completion time based on progress and time elapsed
            estimatedCompletion: calculateEstimatedCompletion(
              item.completedResources.length, 
              item.totalResources
            )
          };
        });
        
        setRoadmapProgress(progressMap);
      }
    } catch (err) {
      console.error("Error fetching roadmap progress:", err);
      // Don't set error since this is not critical functionality
    } finally {
      setSavedRoadmapsLoading(false);
    }
  };
  
  // Helper function to calculate estimated completion time
  const calculateEstimatedCompletion = (completed, total) => {
    if (completed === 0 || total === 0 || completed === total) return null;
    
    // Assuming average pace is 1 resource per day
    const remainingResources = total - completed;
    const daysToComplete = remainingResources;
    
    // Calculate future date
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);
    
    return completionDate;
  };
  
  // Format an estimated completion date
  const formatEstimatedCompletion = (date) => {
    if (!date) return null;
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Calculate days until estimated completion
  const getDaysUntilCompletion = (date) => {
    if (!date) return null;
    
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get a status label based on progress percentage
  const getProgressStatus = (percentage) => {
    if (percentage === 100) return "Completed";
    if (percentage >= 75) return "Almost there";
    if (percentage >= 50) return "Good progress";
    if (percentage >= 25) return "In progress";
    return "Just started";
  };
  
  // Get a color for progress bar based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#4caf50"; // Green
    if (percentage >= 60) return "#8bc34a"; // Light green
    if (percentage >= 40) return "#ffeb3b"; // Yellow
    if (percentage >= 20) return "#ff9800"; // Orange
    return "#f44336"; // Red
  };

  // Fetch roadmap progress after profile data is loaded
  useEffect(() => {
    if (profileData && profileData.savedRoadmaps && profileData.savedRoadmaps.length > 0) {
      fetchRoadmapProgress();
    }
  }, [profileData.savedRoadmaps]);

  // Enhance the personal information section with better inline editing
  const renderEditableField = (label, field, value, type = 'text') => {
    return (
      <div className="info-item">
        <span className="info-label">{label}</span>
        {isEditing && editField === field ? (
          <div className="edit-field">
            {type === 'textarea' ? (
              <textarea 
                value={tempEditValue} 
                onChange={(e) => setTempEditValue(e.target.value)}
                onKeyDown={(e) => handleEditKeyPress(e, field)}
                className="edit-textarea"
                rows={4}
                autoFocus
              />
            ) : (
              <input 
                type={type} 
                value={tempEditValue} 
                onChange={(e) => setTempEditValue(e.target.value)}
                onKeyDown={(e) => handleEditKeyPress(e, field)}
                className="edit-input"
                autoFocus
              />
            )}
            <div className="edit-actions">
              <button onClick={() => saveEdit(field)} className="save-btn" title="Save">
                <i className="fas fa-check"></i>
              </button>
              <button onClick={cancelEditing} className="cancel-btn" title="Cancel">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="edit-hint">Press Enter to save, Esc to cancel</p>
          </div>
        ) : (
          <div className="info-value-container">
            <span className="info-value">{value || 'Not specified'}</span>
            <button 
              className="edit-btn" 
              onClick={() => startEditing(field, value)}
              title="Edit"
            >
              <i className="fas fa-edit"></i>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Add back the unsaveRoadmap function
  const unsaveRoadmap = async (roadmapId) => {
    try {
      const response = await axios.post(`/roadmap/save/${roadmapId}`);
      if (response.data) {
        // Update profileData to remove the unsaved roadmap
        setProfileData({
          ...profileData,
          savedRoadmaps: profileData.savedRoadmaps.filter(rm => rm._id !== roadmapId)
        });
        
        // Show success message
        setError({
          type: 'success',
          message: 'Roadmap removed from saved list'
        });
        
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error unsaving roadmap:", err);
      setError({
        type: 'error',
        message: 'Failed to remove roadmap. Please try again.'
      });
    }
  };

  // Add a preventDefaults helper function back
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle navigation functions
  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error && error.type === 'error') {
    return (
      <div className="profile-page-container">
        <div className="error-message">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="profile-page-container" style={{ minHeight: '100vh', overflowY: 'auto' }}>
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

      <div className="profile-content" style={{ paddingTop: '120px', minHeight: '100vh', overflowY: 'auto' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleFileUpload} 
        />
        <input 
          type="file" 
          ref={documentInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png" 
          onChange={uploadDocument}
          multiple
        />
        
        <button className="dark-mode-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {darkMode ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </button>
        
        {error && error.type === 'success' && (
          <div className="success-notification">
            <i className="fas fa-check-circle"></i> {error.message}
          </div>
        )}
        
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={handleProfilePictureUpload}>
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture} alt={profileData.name} />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="profile-avatar-overlay">
                <i className="fas fa-camera"></i>
              </div>
            </div>
            <div className="profile-name-details">
            <h2>{profileData.name}</h2>
              <p className="profile-field">{profileData.stream || 'Not specified'}</p>
              <p className="profile-id">ID: {profileData.prn}</p>
            </div>
            </div>

          <div className="profile-completion-section">
            <h3>Profile Completion</h3>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
              <span className="progress-text">{completionPercentage}%</span>
            </div>
            <button className="resume-preview-btn" onClick={generateResumePDF}>
              <i className="fas fa-file-pdf"></i> Preview Resume
            </button>
          </div>
        </div>
        
        <div className="profile-content">
          <div className="profile-sidebar">
            <ul className="sidebar-nav">
              <li 
                className={activeSection === 'personal' ? 'active' : ''}
                onClick={() => setActiveSection('personal')}
              >
                <i className="fas fa-user"></i> Personal Details
              </li>
              <li 
                className={activeSection === 'academic' ? 'active' : ''}
                onClick={() => setActiveSection('academic')}
              >
                <i className="fas fa-graduation-cap"></i> Academic Details
              </li>
              <li 
                className={activeSection === 'roadmaps' ? 'active' : ''}
                onClick={() => setActiveSection('roadmaps')}
              >
                <i className="fas fa-map"></i> Saved Roadmaps
              </li>
              <li 
                className={activeSection === 'documents' ? 'active' : ''}
                onClick={() => setActiveSection('documents')}
              >
                <i className="fas fa-file-alt"></i> Documents
              </li>
              <li 
                className={activeSection === 'placement' ? 'active' : ''}
                onClick={() => setActiveSection('placement')}
              >
                <i className="fas fa-building"></i> Placement Status
              </li>
            </ul>
          </div>
          
          <div className="profile-main-content">
            {activeSection === 'personal' && (
              <div className="content-section">
                <h3 className="section-title">Personal Information</h3>
                
                <div className="info-grid">
                  {renderEditableField('Full Name', 'name', profileData.name)}
                  
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <div className="info-value-container">
                      <span className="info-value">{profileData.email}</span>
                    </div>
                  </div>
                  
                  {renderEditableField('Contact Number', 'contactNumber', profileData.contactNumber, 'tel')}
                  
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{profileData.gender || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">{profileData.dob || 'Not specified'}</span>
                  </div>
                  
                  {profileData.socialMedia && (
                    <>
                      {renderEditableField('LinkedIn', 'socialMedia.linkedin', 
                        profileData.socialMedia.linkedin, 'url')}
                      
                      {renderEditableField('GitHub', 'socialMedia.github', 
                        profileData.socialMedia.github, 'url')}
                        
                      {renderEditableField('Personal Website', 'socialMedia.website', 
                        profileData.socialMedia.website, 'url')}
                    </>
                  )}
                  
                  <div className="info-item full-width">
                    <span className="info-label">Hobbies & Interests</span>
                    {isEditing && editField === 'hobbies' ? (
                      <div className="edit-field">
                        <textarea 
                          value={tempEditValue} 
                          onChange={(e) => setTempEditValue(e.target.value)}
                          className="edit-textarea"
                          rows={3}
                          placeholder="Enter hobbies separated by commas (e.g. Reading, Traveling, Photography)"
                        />
                        <p className="edit-hint">Enter hobbies separated by commas</p>
                        <div className="edit-actions">
                          <button 
                            onClick={() => {
                              const hobbiesArray = tempEditValue
                                .split(',')
                                .map(h => h.trim())
                                .filter(h => h);
                              
                              setTempEditValue(hobbiesArray);
                              saveEdit('hobbies');
                            }} 
                            className="save-btn"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button onClick={cancelEditing} className="cancel-btn">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="info-value-container">
                        {profileData.hobbies && profileData.hobbies.length > 0 ? (
                          <div className="tags-container">
                            {profileData.hobbies.map((hobby, index) => (
                              <span key={index} className="hobby-tag">{hobby}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="info-value no-data">No hobbies specified</span>
                        )}
                        <button 
                          className="edit-btn" 
                          onClick={() => startEditing('hobbies', 
                            profileData.hobbies ? profileData.hobbies.join(', ') : '')}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'academic' && (
              <div className="content-section">
                <h3 className="section-title">Academic Information</h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">PRN</span>
                    <span className="info-value">{profileData.prn}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Roll No</span>
                    <span className="info-value">{profileData.rollNo}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Stream</span>
                    <span className="info-value">{profileData.stream}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">10th Percentage</span>
                    <span className="info-value">{profileData.tenthPercentage}%</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">10th School</span>
                    <span className="info-value">{profileData.tenthSchool}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">12th Percentage</span>
                    <span className="info-value">{profileData.twelfthPercentage}%</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">12th College</span>
                    <span className="info-value">{profileData.twelfthCollege}</span>
                  </div>

                  {profileData.stream === "Computer Engineering" && (
                    <div className="info-item">
                      <span className="info-label">Graduation CGPA</span>
                      <span className="info-value">{profileData.graduationCGPA}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeSection === 'roadmaps' && (
              <div className="content-section">
                <h3 className="section-title">
                  <i className="fas fa-bookmark"></i> Saved Roadmaps
                  <span className="roadmap-count">
                    {profileData.savedRoadmaps ? profileData.savedRoadmaps.length : 0} roadmaps
                  </span>
                </h3>
                
                {savedRoadmapsLoading ? (
                  <div className="section-loading">
                    <div className="loading-spinner-small"></div>
                    <p>Loading your saved roadmaps...</p>
                  </div>
                ) : profileData.savedRoadmaps && profileData.savedRoadmaps.length > 0 ? (
                  <div className="roadmaps-container">
                    {profileData.savedRoadmaps.map(roadmap => (
                      <div key={roadmap._id} className="roadmap-card">
                        <div className="roadmap-header">
                          <h4 className="roadmap-title">
                            {roadmap.title || `${roadmap.jobProfile} Roadmap`}
                          </h4>
                          {roadmap.companyId && roadmap.companyId.name && (
                            <span className="roadmap-company">
                              <i className="fas fa-building"></i> {roadmap.companyId.name}
                            </span>
                          )}
                        </div>

                        <p className="roadmap-description">
                          {roadmap.description || `A learning roadmap for ${roadmap.jobProfile || 'career'} roles.`}
                        </p>
                        
                        {roadmapProgress[roadmap._id] && (
                          <div className="roadmap-progress">
                            <div className="progress-label">
                              <span>Progress</span>
                              <span className="progress-percentage">{roadmapProgress[roadmap._id].percentage}%</span>
                            </div>
                            <div className="progress-container">
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${roadmapProgress[roadmap._id].percentage}%`,
                                  backgroundColor: getProgressColor(roadmapProgress[roadmap._id].percentage)
                                }}
                              ></div>
                            </div>
                            <div className="progress-stats">
                              <span>{roadmapProgress[roadmap._id].completedCount}/{roadmapProgress[roadmap._id].totalCount} resources completed</span>
                              <span className="progress-status">{getProgressStatus(roadmapProgress[roadmap._id].percentage)}</span>
                            </div>
                            
                            {/* Estimated completion */}
                            {roadmapProgress[roadmap._id].estimatedCompletion && 
                             roadmapProgress[roadmap._id].percentage < 100 && 
                             roadmapProgress[roadmap._id].percentage > 0 && (
                              <div className="completion-estimate">
                                <i className="far fa-calendar-alt"></i>
                                <span>Estimated completion: {formatEstimatedCompletion(roadmapProgress[roadmap._id].estimatedCompletion)}</span>
                                <span className="days-remaining">
                                  ({getDaysUntilCompletion(roadmapProgress[roadmap._id].estimatedCompletion)} days remaining)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {roadmap.skills && roadmap.skills.length > 0 && (
                          <div className="roadmap-skills">
                            {roadmap.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="roadmap-skill-tag">{skill.skillName}</span>
                            ))}
                            {roadmap.skills.length > 3 && (
                              <span className="roadmap-skill-more">+{roadmap.skills.length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        <div className="roadmap-actions">
                          <button 
                            className="roadmap-view-btn" 
                            onClick={() => navigateToRoadmap(roadmap._id)}
                          >
                            <i className="fas fa-eye"></i> View Roadmap
                          </button>
                          <button 
                            className="roadmap-unsave-btn" 
                            onClick={() => unsaveRoadmap(roadmap._id)}
                            title="Remove from saved roadmaps"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-roadmaps">
                    <i className="fas fa-map-marked-alt roadmap-placeholder-icon"></i>
                    <p>You haven't saved any roadmaps yet.</p>
                    <p className="roadmap-suggestion">Save roadmaps to track your learning journey and keep them organized in one place.</p>
                    <button 
                      className="browse-roadmaps-btn" 
                      onClick={() => navigate('/placement-material')}
                    >
                      <i className="fas fa-search"></i> Browse Roadmaps
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'documents' && (
              <div className="content-section">
                <h3 className="section-title">Documents</h3>
                
                <div className="documents-container">
                  <div className="documents-header">
                    <div className="search-documents">
                      <input 
                        type="text" 
                        placeholder="Search documents..." 
                        className="document-search-input" 
                        value={documentSearchQuery}
                        onChange={(e) => setDocumentSearchQuery(e.target.value)}
                      />
                      <i className="fas fa-search search-icon"></i>
                    </div>
                    
                    <div className="document-filters">
                      <select 
                        className="document-filter-select"
                        value={documentFilter}
                        onChange={(e) => setDocumentFilter(e.target.value)}
                      >
                        <option value="all">All Documents</option>
                        <option value="pdf">PDF Files</option>
                        <option value="word">Word Documents</option>
                        <option value="spreadsheet">Spreadsheets</option>
                        <option value="presentation">Presentations</option>
                        <option value="image">Images</option>
                      </select>
                      
                      <select 
                        className="document-sort-select"
                        value={documentSort}
                        onChange={(e) => setDocumentSort(e.target.value)}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                      </select>
                    </div>
                    
                    <button 
                      className="upload-document-btn"
                      onClick={() => documentInputRef.current.click()}
                      disabled={documentUploadLoading}
                    >
                      {documentUploadLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i> Upload Document
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div 
                    className={`document-dropzone ${isDragging ? 'drag-active' : ''}`}
                    onDragEnter={handleDragIn}
                    onDragLeave={handleDragOut}
                    onDragOver={handleDragOver}
                    onDrop={handleFileDrop}
                  >
                    <div className="dropzone-content">
                      <i className={`fas ${isDragging ? 'fa-file-upload' : 'fa-cloud-upload-alt'}`}></i>
                      <p>{isDragging ? 'Drop files to upload!' : 'Drag & drop files here'}</p>
                      <p className="dropzone-hint">or click the upload button above</p>
                      <p className="dropzone-supported">Supported formats: PDF, Word, Excel, PowerPoint, Images</p>
                    </div>
                  </div>
                  
                  {documents.length > 0 && (
                    <div className="document-stats">
                      <span>Total documents: {documents.length}</span>
                      <span>Showing: {getFilteredAndSortedDocuments().length}</span>
                    </div>
                  )}
                  
                  <div className="document-cards">
                    {profileData.resume && (
                      <div className="document-card">
                        <div className="document-icon">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <div className="document-details">
                          <h4 className="document-name">{profileData.resume.filename}</h4>
                          <p className="document-type">{profileData.resume.contentType}</p>
                          <p className="document-label">Resume</p>
                        </div>
                        <div className="document-actions">
                          <a 
                            href={`/profile/resume/${profileData._id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="document-action-btn view-btn"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </a>
                          <a 
                            href={`/profile/resume/${profileData._id}?download=true`} 
                            className="document-action-btn download-btn"
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {getFilteredAndSortedDocuments().map(doc => (
                      <div key={doc.id} className="document-card">
                        <div className="document-icon">
                          {doc.contentType.includes('pdf') ? (
                            <i className="fas fa-file-pdf"></i>
                          ) : doc.contentType.includes('word') ? (
                            <i className="fas fa-file-word"></i>
                          ) : doc.contentType.includes('sheet') || doc.contentType.includes('excel') ? (
                            <i className="fas fa-file-excel"></i>
                          ) : doc.contentType.includes('presentation') || doc.contentType.includes('powerpoint') ? (
                            <i className="fas fa-file-powerpoint"></i>
                          ) : doc.contentType.includes('image') ? (
                            <i className="fas fa-file-image"></i>
                          ) : (
                            <i className="fas fa-file-alt"></i>
                          )}
                        </div>
                        <div className="document-details">
                          <h4 className="document-name">{doc.filename}</h4>
                          <p className="document-type">{doc.contentType}</p>
                          <p className="document-date">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                        </div>
                        <div className="document-actions">
                          <a 
                            href={`/auth/documents/${doc.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="document-action-btn view-btn"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </a>
                          <a 
                            href={`/auth/documents/${doc.id}`} 
                            download
                            className="document-action-btn download-btn"
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </a>
                          <button 
                            className="document-action-btn delete-btn"
                            onClick={() => deleteDocument(doc.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {documents.length > 0 && getFilteredAndSortedDocuments().length === 0 && (
                    <div className="no-search-results">
                      <p>No documents match your search criteria.</p>
                      <button 
                        className="clear-search-btn"
                        onClick={() => {
                          setDocumentSearchQuery('');
                          setDocumentFilter('all');
                        }}
                      >
                        <i className="fas fa-times"></i> Clear Search
                      </button>
                    </div>
                  )}
                  
                  {(!profileData.resume && documents.length === 0) && (
                    <div className="no-documents">
                      <p>No documents uploaded yet.</p>
                      <button 
                        className="upload-first-document-btn"
                        onClick={() => documentInputRef.current.click()}
                      >
                        <i className="fas fa-cloud-upload-alt"></i> Upload Your First Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeSection === 'placement' && (
              <div className="content-section">
                <h3 className="section-title">Placement Status</h3>
                
                {profileData.placementStatus ? (
                  <div className="placement-status-container">
                    <div className="status-badge">
                      <span className={`status-indicator ${profileData.placementStatus.toLowerCase()}`}>
                        {profileData.placementStatus}
                      </span>
                    </div>
                    
                    {profileData.companyPlaced && (
                      <div className="placement-company">
                        <h4 className="company-label">Company Placed</h4>
                        <p className="company-name">{profileData.companyPlaced}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-placement-status">
                    <p>Your placement status has not been updated yet.</p>
                    <p>Please check back later or contact the placement department.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
          
        <div className="profile-footer">
          <button className="edit-profile-btn" onClick={handleEdit}>
            <i className="fas fa-user-edit"></i> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
