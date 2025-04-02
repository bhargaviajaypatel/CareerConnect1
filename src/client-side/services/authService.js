import axios from 'axios';

const API_URL = 'http://localhost:4000/auth';

// Create axios instance with no security features
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Promise} - Registration response
 */
const register = async (userData) => {
  try {
    const response = await authApi.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Login user - simplified with no security
 * @param {Object} credentials - User login credentials
 * @returns {Promise} - Login response
 */
const login = async (credentials) => {
  try {
    const response = await authApi.post('/', credentials);
    // Store the userId for future use
    if (response.data === "Success" || response.data === "Admin") {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', response.data);
      return { success: true, role: response.data };
    }
    return { success: false, message: response.data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Logout user - simple cleanup
 */
const logout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
};

/**
 * Check if user is logged in
 * @returns {Boolean} - True if user is authenticated
 */
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

/**
 * Get user role
 * @returns {String} - User role (Admin or Success for regular user)
 */
const getUserRole = () => {
  return localStorage.getItem('userRole');
};

/**
 * Set user ID
 * @param {String} userId - User ID to store
 */
const setUserId = (userId) => {
  localStorage.setItem('userId', userId);
};

/**
 * Get user ID
 * @returns {String} - Stored user ID
 */
const getUserId = () => {
  return localStorage.getItem('userId');
};

// Export all auth functions
export default {
  register,
  login,
  logout,
  isAuthenticated,
  getUserRole,
  setUserId,
  getUserId
}; 