import axios from 'axios';

// Axios instance with better configuration
const instance = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 60000, // Extended timeout for debugging
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Allow cookies to be sent with requests
});

// Add a request interceptor for debugging
instance.interceptors.request.use(
  (config) => {
    // Add authentication header if available
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      config.headers['user-email'] = userEmail;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    // Detailed error logging
    if (error.response) {
      console.error(`Response Error (${error.response.status}):`, error.response.data);
      console.error('Full URL:', error.config.baseURL + error.config.url);
    } else if (error.request) {
      console.error('No Response Received:', error.request);
      console.error('Request URL was:', error.config.baseURL + error.config.url);
    } else {
      console.error('Request Setup Error:', error.message);
    }
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;