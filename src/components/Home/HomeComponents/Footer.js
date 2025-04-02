import React from "react";
import "../Home-CSS/Footer.css"; // Assuming you have a separate CSS file for the Footer component

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-wrapper">
        <div className="footer-section-one">
          <h1 style={{ textAlign: "center", marginLeft: "80px", fontSize: "3em", color: "white" }}>
            CareerConnect
          </h1>
        </div>

        <div className="footer-wrapper">
          <div className="footer-section-two">
            <div className="founders-section">
              <h3>Founders</h3>
              <ul>
                <li>Bhargavi Patel</li>
                <li>Bhavik Parmar</li>
                <li>Nivedita Kokane</li>
              </ul>
            </div>
          </div>
          <div className="footer-section-columns">
            <div className="founders-section-2">
              <h3>Contact Us</h3>
              <ul>
                <li>crce.ecs@gmail.com</li>
                <li>crce.ecs@gmail.com</li>
                <li>crce.ecs@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
