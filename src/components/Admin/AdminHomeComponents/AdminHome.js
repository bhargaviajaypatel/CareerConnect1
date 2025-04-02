import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Admin-CSS/AdminNav.css';
import axios from 'axios';

function AdminHome() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated and is an admin
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!isAuthenticated || userRole !== 'Admin') {
      console.log('Not authenticated as admin, redirecting to login');
      navigate('/login');
      return;
    }

    // Verify authentication on server
    axios.get('/auth/verify', {
      params: { email: userEmail },
      headers: { 'user-email': userEmail }
    })
      .then(response => {
        if (response.data === 'Admin') {
          console.log('Admin authentication verified on server');
        } else {
          console.log('Server verification failed, not admin');
          // Clear auth data and redirect
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          navigate('/login');
        }
      })
      .catch(error => {
        console.error('Authentication verification error:', error);
        // Clear auth data and redirect on error
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        navigate('/login');
      });
  }, [navigate]);

  function handleLogout() {
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    // Redirect to login page
    navigate("/login");
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand me-auto" to="/">CareerConnect</Link>
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">CareerConnect</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
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
                  <Link className="nav-link mx-lg-2" to="/interviewreports">Applicant Reports</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link mx-lg-2" to="/" onClick={handleLogout}>Logout</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link mx-lg-2" to="">Profile</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button className="navbar-toggler login-button pe-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon login-button"></span>
        </button>
      </nav>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
        crossOrigin="anonymous">
      </script>
    </div>
  );
}

export default AdminHome;
