import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../api/axiosConfig.js";
import "../../Home/Home-CSS/NewModernHome.css";
import AdminHome from "./AdminHome.js";

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [collegeAnnouncements, setCollegeAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data as fallback
  const MOCK_STATISTICS = {
    studentsPlaced: "587+",
    studentsPlacedIncrease: "12%",
    averagePackage: "41.65 LPA",
    averagePackageIncrease: "7%",
    successRate: "94%",
    successRateIncrease: "5%",
    campusRecruiters: "50+",
    campusRecruitersIncrease: "15%"
  };

  const MOCK_ANNOUNCEMENTS = [
    {
      id: 1,
      title: "Campus Recruitment Drive",
      date: "April 15, 2025",
      content: "Microsoft will be conducting on-campus interviews for final year students."
    },
    {
      id: 2,
      title: "Pre-Placement Workshop",
      date: "April 10, 2025",
      content: "Resume building and interview preparation workshop at the Main Auditorium."
    },
    {
      id: 3,
      title: "Technical Seminar",
      date: "April 12, 2025",
      content: "Industry experts from Google will conduct a technical seminar on Cloud Computing."
    }
  ];

  // Fetch statistics from the database
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/statistics/placements');
      
      if (response.data && response.data.success) {
        setStatistics(response.data.statistics);
      } else {
        console.log("API returned success:false or invalid data format. Using mock data.");
        setStatistics(MOCK_STATISTICS);
      }
    } catch (error) {
      console.log("Error fetching placement statistics:", error);
      // Fallback to mock data on error
      setStatistics(MOCK_STATISTICS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await axios.get('/api/announcements');
      
      if (response.data && Array.isArray(response.data)) {
        setCollegeAnnouncements(response.data);
      } else {
        console.log("API returned invalid data format. Using mock data.");
        setCollegeAnnouncements(MOCK_ANNOUNCEMENTS);
      }
    } catch (error) {
      console.log("Error fetching announcements:", error);
      // Fallback to mock data on error
      setCollegeAnnouncements(MOCK_ANNOUNCEMENTS);
    }
  }, []);

  useEffect(() => {
    // Get admin name from localStorage
    const adminName = localStorage.getItem("userName") || "Admin";
    setCurrentUser({
      name: adminName,
      role: "Admin"
    });

    // Fetch data
    fetchStatistics();
    fetchAnnouncements();
  }, [fetchStatistics, fetchAnnouncements]);

  return (
    <div className="modern-home-container">
      <AdminHome />
      <div className="content-wrapper">
        {/* Hero Section - Matching the user homepage exactly */}
        <section className="hero-section">
          <div className="hero-background"></div>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8 col-md-12 hero-content slide-left">
                <h1 className="hero-title">
                  Career Connect
                </h1>
                <div className="welcome-message">
                  <h2>Hello, <span className="user-name">{currentUser?.name}</span>! <span className="wave-emoji">👋</span></h2>
                  <p className="welcome-tagline">Welcome to your Placement Management System Admin Interface!</p>
                </div>
                <p className="hero-description">
                  Your one-stop platform for campus recruitment opportunities, interview preparation resources, and networking with industry professionals.
                </p>
              </div>
              <div className="col-lg-4 col-md-12 d-none d-lg-block slide-right">
                <div className="hero-image-container">
                  <img
                    src="https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg"
                    alt="College students"
                    className="hero-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Announcements Section - Matching the image */}
        <section className="announcements-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-md-3">
                <div className="d-flex flex-column">
                  <h2 className="campus-announcements-title">Campus Announcements</h2>
                  <p className="mb-0">Stay updated with the latest placement activities</p>
                </div>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-4">
                    <div className="announcement-card">
                      <div className="announcement-header bg-primary text-white p-3">
                        <p className="mb-0">Microsoft will be conducting on-campus interviews for final year students.</p>
                      </div>
                      <div className="announcement-body p-3 text-center">
                        <button className="btn btn-primary btn-sm">Learn More</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="announcement-card">
                      <div className="announcement-header bg-primary text-white p-3">
                        <p className="mb-0">Resume building and interview preparation workshop at the Main Auditorium.</p>
                      </div>
                      <div className="announcement-body p-3 text-center">
                        <button className="btn btn-primary btn-sm">Learn More</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="announcement-card">
                      <div className="announcement-header bg-primary text-white p-3">
                        <p className="mb-0">Industry experts from Google will conduct a technical seminar on Cloud Computing.</p>
                      </div>
                      <div className="announcement-body p-3 text-center">
                        <button className="btn btn-primary btn-sm">Learn More</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Placement Statistics Section - Matching the image */}
        <section className="statistics-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-md-3">
                <div className="d-flex flex-column">
                  <h2 className="placement-statistics-title">Placement Statistics</h2>
                  <p className="mb-0">Tech Institute of Engineering placement achievements</p>
                </div>
              </div>
              <div className="col-md-9">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="statistic-card">
                      <h3 className="statistic-value">587+</h3>
                      <p className="statistic-label">Students Placed</p>
                      <div className="progress">
                        <div className="progress-bar bg-info" style={{ width: '75%' }}></div>
                      </div>
                      <p className="statistic-increase text-success">12% increase</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="statistic-card">
                      <h3 className="statistic-value">41.65 LPA</h3>
                      <p className="statistic-label">Average Package</p>
                      <div className="progress">
                        <div className="progress-bar bg-info" style={{ width: '65%' }}></div>
                      </div>
                      <p className="statistic-increase text-success">7% increase</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="statistic-card">
                      <h3 className="statistic-value">94%</h3>
                      <p className="statistic-label">Success Rate</p>
                      <div className="progress">
                        <div className="progress-bar bg-info" style={{ width: '85%' }}></div>
                      </div>
                      <p className="statistic-increase text-success">5% increase</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="statistic-card">
                      <h3 className="statistic-value">50+</h3>
                      <p className="statistic-label">Campus Recruiters</p>
                      <div className="progress">
                        <div className="progress-bar bg-info" style={{ width: '70%' }}></div>
                      </div>
                      <p className="statistic-increase text-success">15% increase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
