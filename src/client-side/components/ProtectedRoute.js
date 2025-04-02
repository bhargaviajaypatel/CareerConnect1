import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

/**
 * Protected Route component that checks for authentication
 * and redirects to login if not authenticated
 * @param {Object} props Component props
 * @param {React.Component} props.component Component to render if authenticated
 * @param {Array} props.requiredRoles Array of roles allowed to access this route
 * @returns {React.Component} Protected component or redirect
 */
const ProtectedRoute = ({ component: Component, requiredRoles = [], ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = AuthService.getCurrentUser();
      
      // Check if user is logged in
      if (!currentUser) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      
      // Check if role restriction exists and user has required role
      if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      
      // All checks passed
      setAuthorized(true);
      setLoading(false);
    };
    
    checkAuth();
  }, [requiredRoles, location.pathname]);
  
  if (loading) {
    // You can replace this with a loading spinner
    return <div>Loading...</div>;
  }
  
  if (!authorized) {
    // Redirect to login with return url
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace
      />
    );
  }
  
  // Render the protected component
  return <Component {...rest} />;
};

export default ProtectedRoute; 