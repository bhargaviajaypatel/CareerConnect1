import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCompanies } from "../../../redux/companySlice.jsx";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosConfig.js";
import BannerBackground from "../Assets/home-banner-background.png";
import BannerImage from "../Assets/interviewimg.png";
import Navbar from "./Navbar.js";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const companies = useSelector((state) => state.companies.companies);

  const [currentUser, setCurrentUser] = useState(null);
  const [placementStatus, setPlacementStatus] = useState(null);

  useEffect(() => {
    axios
      .get("/auth/verify")
      .then((res) => {
        if (!res.data.status) {
          navigate("/");
        }
      }).catch(err => {
        console.error("Verification error:", err);
        if (err.isNetworkError) {
          console.error("Network error: Please check if the server is running");
        }
        navigate("/");
      });

    // Get the userId or email from localStorage
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');

    // Use either userId or email to fetch user details
    axios
      .get(`/auth/currentUser?${userId ? 'userId=' + userId : 'email=' + userEmail}`)
      .then((res) => {
        setCurrentUser(res.data.user);
        fetchPlacementStatus(res.data.user._id);
      })
      .catch((err) => {
        console.error("Error fetching current user:", err);
      });
  }, [navigate]);

  const fetchPlacementStatus = async (userId) => {
    try {
      const response = await axios.get(`/auth/placementStatus/${userId}`);
      setPlacementStatus(response.data);
    } catch (error) {
      console.error("Error fetching placement status:", error);
      if (error.isNetworkError) {
        console.error("Network error: Please check if the server is running");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/auth/getCompanies");
        dispatch(getCompanies(response.data));
      } catch (err) {
        console.error("Error fetching companies:", err);
        if (err.isNetworkError) {
          console.error("Network error: Please check if the server is running");
        }
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="home-container" style={{ marginTop: '100px' }}>
      <Navbar />
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section">
          {currentUser && (
            <>
              <h1 className="primary-heading" style={{ color: "navy", fontSize: "80px", fontWeight: "700px" }}>
                Welcome {currentUser.name}
              </h1>
              {placementStatus && placementStatus.status === "Placed" && (
  <p style={{
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    color: 'green',
    marginTop: '20px',
    marginLeft:'30px',
    fontWeight: 'bold',
   
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    backgroundColor: 'transparent',
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = 'lightgreen'}
  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
  >
    Congratulations! You are placed at {placementStatus.companyName}
  </p>
)}
            </>
          )}
<p className="primary-text" style={{ textAlign: 'center', marginLeft: '20px' }}>Welcome to your Placement Management System! Explore career opportunities, company profiles, and upcoming interviews. Manage your profile, upload resumes, and track application progress seamlessly.</p>

           
        </div>
        <div className="home-image-section">
          <img src={BannerImage} style={{ width: "570px", height: "550px" }} alt="Banner" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
