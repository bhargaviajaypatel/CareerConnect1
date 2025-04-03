import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig.js"; // Use axiosConfig instead of direct axios
import "./Login-CSS/login.css";

function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const navigate = useNavigate();
  
  // Handle redirection countdown
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
        console.log(`Countdown: ${redirectCountdown - 1} seconds remaining`);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (redirectCountdown === 0) {
      const userRole = localStorage.getItem('userRole');
      console.log(`Redirect triggered with role: ${userRole}`);
      if (userRole === "Admin") {
        console.log("Navigating to /admin");
        navigate("/admin");
      } else {
        console.log("Navigating to /home");
        navigate("/home");
      }
    }
  }, [redirectCountdown, navigate]);
  
  // Check authentication status on component mount
  useEffect(() => {
    // Clear existing auth data if we're on login page
    if (window.location.pathname === '/login') {
      console.log("Login page loaded, clearing any stale auth data");
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
    }
    
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (isAuthenticated) {
      console.log("User is already authenticated as:", userRole);
      // Redirect based on role
      if (userRole === "Admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      return;
    }
  }, [navigate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setUserData(null);
    setIsLoading(true);
    setRedirectCountdown(null);

    if (!email || !password) {
      setErrorMessage("Email and password are required");
      setIsLoading(false);
      return;
    }

    const userData = { email, password };
    console.log("Attempting login with:", email);
    
    // API call using our configured axios instance
    axios.post("/auth", userData)
      .then((response) => {
        console.log("Login response:", response.data);
        
        if (response.data === "Success" || response.data === "Admin") {
          // Clear any previous auth data
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          
          // Store authentication state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', response.data);
          localStorage.setItem('userEmail', email);

          // Success message
          setSuccessMessage(`Login successful! Redirecting now...`);
          
          // Fetch user data after successful login
          fetchUserByEmail(email);
          
          // Try multiple navigation approaches
          setTimeout(() => {
            try {
              console.log("Attempting navigation with React Router");
              if (response.data === "Admin") {
                navigate("/admin");
                
                // As a backup, also try direct browser navigation
                setTimeout(() => {
                  console.log("Forcing direct browser navigation to /admin");
                  window.location.href = "/admin";
                }, 500);
              } else {
                navigate("/home");
                
                // As a backup, also try direct browser navigation
                setTimeout(() => {
                  console.log("Forcing direct browser navigation to /home");
                  window.location.href = "/home";
                }, 500);
              }
            } catch (error) {
              console.error("Navigation error:", error);
              // Fallback to direct browser navigation
              window.location.href = response.data === "Admin" ? "/admin" : "/home";
            }
          }, 1000);
        } else {
          setErrorMessage("Invalid email or password");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        if (err.response) {
          setErrorMessage(err.response.data.message || "Login failed");
        } else if (err.message === "Network Error") {
          setErrorMessage("Network Error: Please check if the server is running");
        } else {
          setErrorMessage("An error occurred. Please try again.");
        }
        setIsLoading(false);
      });
  };
  
  // Function to fetch user data by email
  const fetchUserByEmail = (email) => {
    axios.get(`/auth/getUserByEmail?email=${email}`)
      .then((response) => {
        if (response.data) {
          console.log("User data fetched:", response.data);
          setUserData(response.data);
          // Store user ID for future API calls
          if (response.data._id) {
            localStorage.setItem('userId', response.data._id);
          }
        } else {
          console.warn("No user data returned for:", email);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setIsLoading(false);
        // Continue with redirection even if user data fetch fails
        // The Home component will try to fetch it again
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to CareerConnect</h1>
          <p className="login-subtitle">Your gateway to career opportunities</p>
        </div>
        
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {redirectCountdown !== null && (
        <div className="redirect-countdown">Redirecting in {redirectCountdown} seconds...</div>
      )}
        
        <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email
            </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="form-control"
            required
            disabled={isLoading || redirectCountdown !== null}
          />
        </div>
        <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Password
            </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="form-control"
            required
            disabled={isLoading || redirectCountdown !== null}
          />
        </div>
        <button 
          type="submit" 
          className="login-btn" 
          disabled={isLoading || redirectCountdown !== null}
        >
            {isLoading ? 
              <><i className="fas fa-spinner fa-spin"></i> Logging in...</> : 
              <><i className="fas fa-sign-in-alt"></i> LOGIN</>
            }
        </button>
      </form>
        
        <div className="login-footer">
      <div className="register-link">
        <p>Don't have an account? <a href="/register">REGISTER</a></p>
      </div>
      <div className="forgot-password">
        <a href="/forgotpassword">Forgot Password?</a>
      </div>
      </div>
      </div>
    </div>
  );
}

export default Login;
