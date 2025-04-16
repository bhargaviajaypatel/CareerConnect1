import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import '../Home-CSS/Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/announcements');
        if (response.data.status) {
          setAnnouncements(response.data.announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <section className="announcements-section">
        <div className="container">
          <div className="announcements-container">
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading announcements...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="announcements-section">
      <div className="container">
        <div className="announcements-container">
          <div className="announcements-header">
            <h2>Campus Announcements</h2>
            <p>Stay updated with the latest placement activities</p>
          </div>
          <div className="announcements-cards">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div className="announcement-card" key={announcement._id}>
                  <div className="announcement-content">
                    <h3>{announcement.title}</h3>
                    <p>{announcement.content}</p>
                  </div>
                  <div className="announcement-action">
                    <a href="#" className="learn-more-btn">Learn More</a>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-announcements">
                <p>No announcements available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Announcements;
