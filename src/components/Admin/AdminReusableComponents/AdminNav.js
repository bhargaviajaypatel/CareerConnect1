import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../Admin-CSS/AdminNav.css";

function AdminNav() {
  function handleLogout() {
    localStorage.removeItem('token');
  }
  
  // Ensure Bootstrap JS is loaded for mobile menu functionality
  useEffect(() => {
    // Check if Bootstrap JS is already loaded
    if (!window.bootstrap) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
      script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }
  }, []);
  
  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand me-auto" to="/">CareerConnect</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to="/admin">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to="/admindashboard">Reports</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to="/companies">Manage Companies</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to="/scheduledinterviewdata">Interview Reports</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to="/Profile">Profile</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to="/" onClick={handleLogout}>Logout</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        
      </section>
    </>
  );
}



export default AdminNav;
