import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaRedo } from 'react-icons/fa';
import '../Admin-CSS/AnnouncementManager.css';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    active: true
  });
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Mock data for fallback
  const MOCK_ANNOUNCEMENTS = [
    {
      _id: 'mock1',
      title: 'Microsoft Campus Interviews',
      description: 'Microsoft will be conducting on-campus interviews for final year students.',
      link: '#',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock2',
      title: 'Resume Building Workshop',
      description: 'Resume building and interview preparation workshop at the Main Auditorium.',
      link: '#',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock3',
      title: 'Technical Seminar on Cloud Computing',
      description: 'Industry experts from Google will conduct a technical seminar on Cloud Computing.',
      link: '#',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/announcements');
      
      if (response.data && response.data.success) {
        setAnnouncements(response.data.announcements);
      } else {
        console.log('API returned success:false. Using mock data.');
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Using mock data.');
      setAnnouncements(MOCK_ANNOUNCEMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      link: '',
      active: true
    });
    setEditMode(false);
    setCurrentId(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // Update existing announcement
        const response = await axios.put(`/api/admin/announcements/${currentId}`, formData);
        
        if (response.data && response.data.success) {
          // Update the announcements list
          setAnnouncements(announcements.map(announcement => 
            announcement._id === currentId ? response.data.announcement : announcement
          ));
          resetForm();
        }
      } else {
        // Create new announcement
        const response = await axios.post('/api/admin/announcements', formData);
        
        if (response.data && response.data.success) {
          // Add the new announcement to the list
          setAnnouncements([response.data.announcement, ...announcements]);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError('Failed to save announcement. Please try again.');
      
      // If in development or mock mode, simulate successful operation
      if (process.env.NODE_ENV === 'development' || !announcements.some(a => a._id !== 'mock1')) {
        if (editMode) {
          // Simulate update
          const updatedAnnouncements = announcements.map(announcement => 
            announcement._id === currentId 
              ? { ...announcement, ...formData, updatedAt: new Date().toISOString() }
              : announcement
          );
          setAnnouncements(updatedAnnouncements);
        } else {
          // Simulate create
          const newAnnouncement = {
            _id: `mock${Date.now()}`,
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setAnnouncements([newAnnouncement, ...announcements]);
        }
        resetForm();
      }
    }
  };

  // Edit an announcement
  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      description: announcement.description,
      link: announcement.link || '',
      active: announcement.active
    });
    setEditMode(true);
    setCurrentId(announcement._id);
  };

  // Delete an announcement
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/admin/announcements/${id}`);
      
      if (response.data && response.data.success) {
        // Remove the announcement from the list
        setAnnouncements(announcements.filter(announcement => announcement._id !== id));
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement. Please try again.');
      
      // If in development or mock mode, simulate successful delete
      if (process.env.NODE_ENV === 'development' || !announcements.some(a => a._id !== 'mock1')) {
        setAnnouncements(announcements.filter(announcement => announcement._id !== id));
      }
    }
  };

  // Toggle announcement active status
  const toggleActive = async (id, currentActive) => {
    try {
      const response = await axios.put(`/api/admin/announcements/${id}`, {
        active: !currentActive
      });
      
      if (response.data && response.data.success) {
        // Update the announcements list
        setAnnouncements(announcements.map(announcement => 
          announcement._id === id 
            ? { ...announcement, active: !currentActive }
            : announcement
        ));
      }
    } catch (err) {
      console.error('Error toggling announcement status:', err);
      setError('Failed to update announcement status. Please try again.');
      
      // If in development or mock mode, simulate successful toggle
      if (process.env.NODE_ENV === 'development' || !announcements.some(a => a._id !== 'mock1')) {
        setAnnouncements(announcements.map(announcement => 
          announcement._id === id 
            ? { ...announcement, active: !currentActive }
            : announcement
        ));
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="announcement-manager-container">
      <div className="announcement-manager-header">
        <h2>Campus Announcements Manager</h2>
        <p>Create and manage announcements that will be displayed on the student homepage</p>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="announcement-form-container">
        <h3>{editMode ? 'Edit Announcement' : 'Create New Announcement'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Enter announcement title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              required
              rows="3"
              placeholder="Enter announcement description"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="link">Link (Optional)</label>
            <input
              type="text"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter link for 'Learn More' button"
            />
          </div>
          
          <div className="form-check">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="form-check-input"
            />
            <label className="form-check-label" htmlFor="active">
              Active (visible on homepage)
            </label>
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Update Announcement' : 'Create Announcement'}
            </button>
            {editMode && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="announcements-list-container">
        <div className="announcements-list-header">
          <h3>Existing Announcements</h3>
          <button 
            className="btn btn-outline-primary refresh-btn"
            onClick={fetchAnnouncements}
          >
            <FaRedo /> Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading announcements...</p>
          </div>
        ) : announcements.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement._id} className={!announcement.active ? 'inactive-row' : ''}>
                    <td>{announcement.title}</td>
                    <td>
                      <div className="description-cell">
                        {announcement.description}
                      </div>
                    </td>
                    <td>{formatDate(announcement.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${announcement.active ? 'active' : 'inactive'}`}>
                        {announcement.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(announcement)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(announcement._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                        <button 
                          className={`btn btn-sm ${announcement.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleActive(announcement._id, announcement.active)}
                          title={announcement.active ? 'Deactivate' : 'Activate'}
                        >
                          {announcement.active ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No announcements found. Create your first announcement using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;
