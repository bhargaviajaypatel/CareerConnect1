import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
//import AdminHome from "../AdminHomeComponents/AdminHome.js";
import Home from "./AdminHomeComponents/Home.js";
import About from "./AdminHomeComponents/About.js";
import Work from "./AdminHomeComponents/Work.js";
import Footer from "./AdminReusableComponents/AdminFooter.js";

function Admin() {
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
  
  return (
    <>
      <Home />
      <About />
      <Work />
      <Footer />
    </>
  );
}

export default Admin
