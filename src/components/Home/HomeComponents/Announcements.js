import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import '../Home-CSS/Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data as fallback
  const MOCK_ANNOUNCEMENTS = [
    {
      _id: 'mock1',
      title: 'Microsoft Campus Interviews',
      description: 'Microsoft will be conducting on-campus interviews for final year students.',
      link: '#'
    },
    {
      _id: 'mock2',
      title: 'Resume Building Workshop',
      description: 'Resume building and interview preparation workshop at the Main Auditorium.',
      link: '#'
    },
    {
      _id: 'mock3',
      title: 'Technical Seminar on Cloud Computing',
      description: 'Industry experts from Google will conduct a technical seminar on Cloud Computing.',
      link: '#'
    }
  ];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/announcements');
        
        if (response.data && response.data.success && response.data.announcements.length > 0) {
          setAnnouncements(response.data.announcements);
        } else {
          console.log("API returned success:false or empty data. Using mock data.");
          setAnnouncements(MOCK_ANNOUNCEMENTS);
        }
      } catch (error) {
        console.log("Error fetching announcements:", error);
        // Fallback to mock data on error
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <section className="announcements-section">
      <div className="container">
        <div className="announcements-container">
          <div className="announcements-header">
            <h2>Campus Announcements</h2>
            <p>Stay updated with the latest placement activities</p>
          </div>
          
          <div className="announcements-cards">
            {loading ? (
              <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading announcements...</p>
              </div>
            ) : (
              announcements.map((announcement, index) => (
                <div className="announcement-card" key={announcement._id || index}>
                  <div className="announcement-content">
                    <h3>{announcement.title}</h3>
                    <p>{announcement.description}</p>
                  </div>
                  <div className="announcement-action">
                    <a href={announcement.link || "#"} className="learn-more-btn">Learn More</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Announcements;
