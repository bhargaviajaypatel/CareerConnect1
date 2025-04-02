import React from "react";
import BannerBackground from "../Assets/home-banner-background.png";
import BannerImage from "../Assets/interviewimg.png";

import AdminHome from "./AdminHome.js";

const Home = () => {
  return (
    <div className="home-container" style={{ marginTop: '100px' }}>
      <AdminHome />
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="Background for the home banner" />
        </div>
        <div className="home-text-section">
          <h1 className="primary-heading" style={{ color: "navy", fontSize: "50px", fontWeight: "700", marginLeft: "150px" }}>
            Welcome Admin
          </h1>
          <p className="primary-text" style={{ marginLeft: "150px" }}>
            Welcome to your Placement Management System Admin Interface! Enables efficient data management for company details and interview reports. Admins can effortlessly filter student data, manage company information, and oversee interview reports, facilitating streamlined placement operations.
          </p>
        </div>
        <div className="home-image-section">
          <img src={BannerImage} alt="Illustration related to interviews" style={{ width: "570px", height: "550px" }} />
        </div>
      </div>

      {/* Charts have been removed from this section */}
    </div>
  );
};

export default Home;
