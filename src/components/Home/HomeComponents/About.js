import React from "react";
import AboutBackground from "../Assets/aboutus.png";
import Image1PD from "../Assets/placementdirector.jpg";
import JayenModi from "../../Home/Assets/Jayen Modi.jpg";
import SaurabhKorgaonkar from "../../Home/Assets/Saurabh Korgaonkar.jpg";
import SwapnaliMakadey from "../../Home/Assets/Swapnali Makadey.jpg"; 
import VijayShelke from "../../Home/Assets/Vijay Shelke.jpg";
import AboutBackgroundImage from "../Assets/aboutusimg.png";
import '../Home-CSS/About.css';

const About = () => {
  return (
    <div className="about-section-container">
      <div className="about-background-image-container">
        <img src={AboutBackground} alt="" />
      </div>

      <div className="about-section-image-container">
      </div>
      
      <p className="primary-subheading" style={{ color: "navy", fontSize: "50px", marginTop: "-450px", marginRight: "-750px" }}>About</p>
      
      <div className="about-section-text-container">
        <div className="card-container" style={{ marginTop: "150px", marginRight: "30px" }}>
          
          {/* Existing Cards */}
          <div className="card" style={{ height: "400px", width: "250px" }}>
            <img src={Image1PD} className="card-img-top" alt="..." />
            <div className="card-body">
              <p className="card-text" style={{ fontSize: "1.2rem" }}><b>Mr. Mahesh.R.Sharma</b><br />Placement Director</p>
            </div>
          </div>

          <div className="card" style={{ height: "400px", width: "250px" }}>
            <img src={JayenModi} className="card-img-top" alt="..." />
            <div className="card-body">
              <p className="card-text" style={{ fontSize: "1.2rem" }}><b>Jayen Modi</b><br />Co-ordinator - Electronics and Computer Science</p>
            </div>
          </div>

          <div className="card" style={{ height: "400px", width: "250px" }}>
            <img src={SaurabhKorgaonkar} className="card-img-top" alt="..." />
            <div className="card-body">
              <p className="card-text" style={{ fontSize: "1.2rem" }}><b>Saurabh Korgaonkar</b><br />Co-ordinator - Mechanical Engineering</p>
            </div>
          </div>

          {/* New Cards */}
          <div className="card" style={{ height: "400px", width: "250px" }}>
            <img src={SwapnaliMakadey} className="card-img-top" alt="..." />
            <div className="card-body">
              <p className="card-text" style={{ fontSize: "1.2rem" }}><b>Swapnali Makadey</b><br />Co-ordinator - Ai & Data Science</p>
            </div>
          </div>

          <div className="card" style={{ height: "400px", width: "250px" }}>
            <img src={VijayShelke} className="card-img-top" alt="..." />
            <div className="card-body">
              <p className="card-text" style={{ fontSize: "1.2rem" }}><b>Vijay Shelke</b><br />Co-ordinator - Computer Engineering</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
