import { useState, useEffect, useRef, useContext } from "react";
import axios from "../../api/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import Navbar from "../Home/HomeComponents/Navbar.js";
import Footer from "../Home/HomeComponents/Footer.js";
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
        await fetchSavedRoadmaps();
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
        console.log("Profile data received:", response.data.user);
        console.log("Placement data:", {
          status: response.data.user.placementStatus,
          company: response.data.user.companyPlaced,
          package: response.data.user.package,
          position: response.data.user.position,
          location: response.data.user.location
        });
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
      // Get the userId from localStorage
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }
      
      // Add userId as a query parameter
      const response = await axios.get(`/auth/documents?userId=${userId}`);
      
      if (response.data && response.data.documents) {
        setDocuments(response.data.documents);
      }
    } catch (err) {
      console.log("Error fetching documents:", err);
    }
  };
  
  const triggerDocumentUpload = () => {
    documentInputRef.current.click();
  };
  
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setDocumentUploadLoading(true);
    
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError({
          type: 'error',
          message: 'User ID not found. Please log in again.'
        });
        return;
      }
      
      // Create FormData for each file
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('document', files[i]);
        
        // Post to the correct endpoint
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
      
      // Refresh documents list
      await fetchDocuments();
      
      setError({
        type: 'success',
        message: `${files.length > 1 ? files.length + ' documents' : 'Document'} uploaded successfully!`
      });
      
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error uploading documents:", err);
      setError({
        type: 'error',
        message: "Failed to upload documents. Please try again."
      });
    } finally {
      setDocumentUploadLoading(false);
      // Reset the file input value to allow uploading the same file again
      e.target.value = '';
    }
  };
  
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }
    
    try {
      const response = await axios.delete(`/auth/documents/${documentId}`);
      
      if (response.data && response.data.success) {
        // Remove from local state
        setDocuments(documents.filter(doc => doc._id !== documentId));
        
        setError({
          type: 'success',
          message: "Document deleted successfully!"
        });
        
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError({
        type: 'error',
        message: "Failed to delete document. Please try again."
      });
    }
  };
  
  const filteredDocuments = () => {
    if (!documentSearchQuery.trim()) return documents;
    
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
      doc.fileType.toLowerCase().includes(documentSearchQuery.toLowerCase())
    );
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getDocumentIcon = (fileType) => {
    const iconMap = {
      'pdf': 'fas fa-file-pdf',
      'doc': 'fas fa-file-word',
      'docx': 'fas fa-file-word',
      'jpg': 'fas fa-file-image',
      'jpeg': 'fas fa-file-image',
      'png': 'fas fa-file-image',
      'txt': 'fas fa-file-alt'
    };
    
    return iconMap[fileType.toLowerCase()] || 'fas fa-file';
  };
  
  const fetchRoadmapProgress = async () => {
    try {
      setSavedRoadmapsLoading(true);
      const response = await axios.get('/roadmaps/progress');
      
      if (response.data && response.data.progressData) {
        setRoadmapProgress(response.data.progressData);
      }
    } catch (err) {
      console.error("Error fetching roadmap progress:", err);
    } finally {
      setSavedRoadmapsLoading(false);
    }
  };

  // Add a function to fetch saved roadmaps
  const fetchSavedRoadmaps = async () => {
    try {
      setSavedRoadmapsLoading(true);
      
      // First try to fetch from API
      try {
        const response = await axios.get('/roadmap/saved');
        if (response.data && response.data.savedRoadmaps) {
          setProfileData({
            ...profileData,
            savedRoadmaps: response.data.savedRoadmaps
          });
        }
      } catch (apiError) {
        console.error("Error fetching saved roadmaps from API:", apiError);
        
        // Fallback to localStorage if API fails
        const savedRoadmapsFromStorage = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
        if (savedRoadmapsFromStorage.length > 0) {
          setProfileData({
            ...profileData,
            savedRoadmaps: savedRoadmapsFromStorage
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchSavedRoadmaps:", error);
      setError({
        type: 'error',
        message: 'Failed to load saved roadmaps. Please try again.'
      });
    } finally {
      setSavedRoadmapsLoading(false);
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
              <button onClick={() => saveEdit(field)} className="save-btn">
                <i className="fas fa-check"></i> Save
              </button>
              <button onClick={cancelEditing} className="cancel-btn">
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
            <span className="edit-hint">Press Enter to save, Esc to cancel</span>
          </div>
        ) : (
          <div className="info-value-container">
            <span className="info-value">{value || 'Not specified'}</span>
            <button 
              className="edit-btn" 
              onClick={() => startEditing(field, value)}
              title="Edit"
            >
              <i className="fas fa-edit"></i> Edit
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
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile data...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error && error.type === 'error') {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="error-message">{error.message || error}</div>
          <button className="resume-preview-btn" onClick={() => navigate('/')}>
            <i className="fas fa-home"></i> Go Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page-container">
        {/* Hidden file input for profile picture upload */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept="image/*"
        />
        
        {/* Hidden file input for document upload */}
        <input
          type="file"
          ref={documentInputRef}
          style={{ display: 'none' }}
          onChange={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          multiple
        />
        
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          {/* Profile Avatar Container */}
          <div className="profile-avatar-container">
            <div className="profile-avatar" onClick={handleProfilePictureUpload}>
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture} alt={profileData.name} />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </div>
            
            <div className="profile-name-details">
              <h2>{profileData.name || 'Shaurya Mehta'}</h2>
              <p className="profile-field">{profileData.stream || 'Computer Engineering'}</p>
              <p className="profile-id">ID: {profileData.prn || ''}</p>
            </div>
          </div>
          
          {/* Profile Completion Section */}
          <div className="profile-completion-section">
            <h3>Profile Completion</h3>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <button className="resume-preview-btn" onClick={generateResumePDF}>
              <i className="fas fa-file-pdf"></i> Preview Resume
            </button>
          </div>
          
          {/* Navigation Menu */}
          <div className="sidebar-nav">
            <ul>
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
        </div>
        
        {/* Main Content Area */}
        <div className="profile-main-content">
          {/* Edit Profile Button */}
          <button className="edit-profile-btn" onClick={handleEdit}>
            <i className="fas fa-user-edit"></i> Edit Profile
          </button>

          {/* Content sections all wrapped in profile-content-wrapper */}
          <div className="profile-content-wrapper">
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="content-section">
                <h3 className="section-title">
                  <i className="fas fa-user"></i> Personal Information
                </h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{profileData.name || 'Shaurya Mehta'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profileData.email || 'student@careerconnect.com'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Contact Number</span>
                    <span className="info-value">{profileData.contactNumber || '9781238322'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{profileData.gender || 'Female'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">{profileData.dob || 'Thu Dec 05 2002'}</span>
                    <div className="info-value" style={{fontSize: '0.85rem', color: '#888'}}>
                      {profileData.dobTimezone || '07:28:04 GMT+0530 (India Standard Time)'}
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">LinkedIn</span>
                    <span className="info-value">
                      {profileData.socialMedia?.linkedin || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">GitHub</span>
                    <span className="info-value">
                      {profileData.socialMedia?.github || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Personal Website</span>
                    <span className="info-value">
                      {profileData.socialMedia?.website || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="info-item full-width">
                    <span className="info-label">Hobbies & Interests</span>
                    <span className="info-value">
                      {profileData.hobbies && profileData.hobbies.length > 0 ? 
                        profileData.hobbies.join(', ') : 'No hobbies specified'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Academic Information Section */}
            {activeSection === 'academic' && (
              <div className="content-section">
                <h3 className="section-title">
                  <i className="fas fa-graduation-cap"></i> Academic Information
                </h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">PRN</span>
                    <span className="info-value">{profileData.prn || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Roll No</span>
                    <span className="info-value">{profileData.rollNo || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Stream</span>
                    <span className="info-value">{profileData.stream || 'Computer Engineering'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">10th Percentage</span>
                    <span className="info-value">{profileData.tenthPercentage ? `${profileData.tenthPercentage}%` : 'Not specified'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">10th School</span>
                    <span className="info-value">{profileData.tenthSchool || 'Not specified'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">12th Percentage</span>
                    <span className="info-value">{profileData.twelfthPercentage ? `${profileData.twelfthPercentage}%` : 'Not specified'}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">12th College</span>
                    <span className="info-value">{profileData.twelfthCollege || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">CGPA</span>
                    <span className="info-value">{profileData.cgpa || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Current Year</span>
                    <span className="info-value">{profileData.currentYear || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Current Semester</span>
                    <span className="info-value">{profileData.currentSemester || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Saved Roadmaps Section */}
            {activeSection === 'roadmaps' && (
              <div className="content-section">
                <h3 className="section-title">
                  <i className="fas fa-map"></i> Saved Roadmaps
                </h3>
                
                {savedRoadmapsLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your saved roadmaps...</p>
                  </div>
                ) : profileData.savedRoadmaps && profileData.savedRoadmaps.length > 0 ? (
                  <div className="saved-roadmaps-container">
                    {profileData.savedRoadmaps.map((roadmap, index) => (
                      <div key={roadmap.roadmapId || index} className="roadmap-card">
                        <div className="roadmap-card-header">
                          <h4 className="roadmap-title">{roadmap.title || "Career Preparation Path"}</h4>
                          <span className="roadmap-company">{roadmap.company || "Custom Roadmap"}</span>
                        </div>
                        
                        <p className="roadmap-description">
                          {roadmap.description || "Follow this structured learning path to prepare for your interviews."}
                        </p>
                        
                        <div className="roadmap-skills">
                          {roadmap.skills && roadmap.skills.length > 0 ? (
                            <>
                              <h5>Key Skills:</h5>
                              <div className="skills-list">
                                {roadmap.skills.slice(0, 5).map((skill, idx) => (
                                  <span key={idx} className="skill-tag">
                                    {typeof skill === 'object' ? skill.name : skill}
                                  </span>
                                ))}
                                {roadmap.skills.length > 5 && (
                                  <span className="skill-tag more-skills">+{roadmap.skills.length - 5} more</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="no-skills">No specific skills defined for this roadmap.</p>
                          )}
                        </div>
                        
                        <div className="roadmap-footer">
                          <span className="saved-date">
                            Saved on: {new Date(roadmap.savedAt || Date.now()).toLocaleDateString()}
                          </span>
                          
                          <div className="roadmap-actions">
                            <button 
                              className="view-roadmap-btn"
                              onClick={() => navigateToRoadmap(roadmap.roadmapId)}
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                            
                            <button 
                              className="remove-roadmap-btn"
                              onClick={() => unsaveRoadmap(roadmap.roadmapId)}
                            >
                              <i className="fas fa-trash"></i> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-roadmaps-message">
                    <p>You haven't saved any roadmaps yet.</p>
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
            
            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="content-section">
                <h3 className="section-title">
                  <i className="fas fa-file-alt"></i> Documents
                </h3>
                
                <div>
                  <button className="upload-document-btn" onClick={triggerDocumentUpload}>
                    <i className="fas fa-upload"></i> Upload Document
                  </button>
                  
                  {documentUploadLoading && (
                    <div className="section-loading">
                      <div className="loading-spinner-small"></div>
                      <p>Uploading document...</p>
                    </div>
                  )}
                  
                  {documents.length > 0 ? (
                    <div className="document-cards">
                      {documents.map((doc) => (
                        <div className="document-card" key={doc._id || doc.id || 'doc-1'}>
                          <h4>{doc.name || doc.filename || 'Document'}</h4>
                          <p>{doc.fileType || doc.contentType || 'Document type'}</p>
                          <div className="document-card-buttons">
                            <button 
                              className="view-btn"
                              onClick={() => {
                                if (doc.fileUrl) {
                                  window.open(doc.fileUrl, '_blank');
                                } else if (doc.path) {
                                  // Handle server-side path viewing
                                  window.open(`/auth/documents/view/${doc._id || doc.id}`, '_blank');
                                }
                              }}
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                            <button 
                              className="download-btn"
                              onClick={() => {
                                if (doc.fileUrl) {
                                  // For client-side URL download
                                  const a = document.createElement('a');
                                  a.href = doc.fileUrl;
                                  a.download = doc.name || doc.filename || 'document';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                } else if (doc._id || doc.id) {
                                  // For server-side document download
                                  window.open(`/auth/documents/download/${doc._id || doc.id}`, '_blank');
                                }
                              }}
                            >
                              <i className="fas fa-download"></i> Download
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteDocument(doc._id || doc.id)}
                            >
                              <i className="fas fa-trash-alt"></i> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No documents uploaded yet</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Placement Status Section */}
            {activeSection === 'placement' && (
              <div className="content-section">
                <h3 className="section-title">
                  <i className="fas fa-building"></i> Placement Status
                </h3>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-value">
                      <span className={`status-indicator ${(profileData.placementStatus || "").toLowerCase()}`}>
                        {profileData.placementStatus || "Not specified"}
                      </span>
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Company</span>
                    <span className="info-value">{profileData.companyPlaced || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Package</span>
                    <span className="info-value">{profileData.package ? `₹${profileData.package} LPA` : 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Position</span>
                    <span className="info-value">{profileData.position || 'Not specified'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{profileData.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProfilePage;
