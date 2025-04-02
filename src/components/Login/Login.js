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
  const [mongoDbStatus, setMongoDbStatus] = useState("Checking connection...");
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
  
  // Check authentication status and MongoDB connection on component mount
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

    // Check MongoDB connection
    axios.get("/auth/all")
      .then(response => {
        if (response.data && response.data.length > 0) {
          setMongoDbStatus("Connected - Found " + response.data.length + " users");
        } else {
          setMongoDbStatus("Connected - No users found");
        }
      })
      .catch(err => {
        console.error("MongoDB connection error:", err);
        setMongoDbStatus("Error connecting: " + (err.message || "Network error"));
      });
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

  // Function for direct login (for testing)
  const handleDirectLogin = (emailToUse, roleType) => {
    setIsLoading(true);
    
    // Clear any previous auth data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    
    // Set new auth data
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', roleType);
    localStorage.setItem('userEmail', emailToUse);
    
    setSuccessMessage(`Direct login as ${roleType.toLowerCase()}. Redirecting...`);
    
    // Fetch user data for the demo account
    fetchUserByEmail(emailToUse);
    
    // Try multiple navigation approaches
    setTimeout(() => {
      try {
        console.log("Attempting navigation with React Router for demo account");
        if (roleType === "Admin") {
          navigate("/admin");
          
          // As a backup, also try direct browser navigation
          setTimeout(() => {
            console.log("Forcing direct browser navigation to /admin for demo account");
            window.location.href = "/admin";
          }, 500);
        } else {
          navigate("/home");
          
          // As a backup, also try direct browser navigation
          setTimeout(() => {
            console.log("Forcing direct browser navigation to /home for demo account");
            window.location.href = "/home";
          }, 500);
        }
      } catch (error) {
        console.error("Navigation error for demo account:", error);
        // Fallback to direct browser navigation
        window.location.href = roleType === "Admin" ? "/admin" : "/home";
      }
    }, 1000);
  };
  
  // Special function for Bhargavi's account
  const handleBhargaviLogin = () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("Starting login process for Bhargavi's account...");
    
    // Clear any previous auth data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    
    const loginData = { 
      email: "bhargavi04092003@gmail.com", 
      password: "Nivedit@123" 
    };
    
    console.log("Sending direct login request for Bhargavi's account");
    
    // Direct API call with specific credentials
    axios.post("/auth", loginData)
      .then((response) => {
        console.log("Bhargavi login response:", response.data);
        
        if (response.data === "Success" || response.data === "Admin") {
          // Store authentication state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', response.data);
          localStorage.setItem('userEmail', "bhargavi04092003@gmail.com");
          localStorage.setItem('userId', "67e76c9a16d66db9c396691b");
          
          // Success message
          setSuccessMessage(`Login successful for Bhargavi! Redirecting now...`);
          console.log("Authentication state set, userId:", localStorage.getItem('userId'));
          
          // Try multiple navigation approaches
          setTimeout(() => {
            try {
              console.log("Attempting navigation with React Router");
              navigate("/home");
              
              // As a backup, also try direct browser navigation
              setTimeout(() => {
                console.log("Forcing direct browser navigation to /home");
                window.location.href = "/home";
              }, 500);
            } catch (error) {
              console.error("Navigation error:", error);
              // Fallback to direct browser navigation
              window.location.href = "/home";
            }
          }, 1000);
        } else {
          setErrorMessage("Login failed for Bhargavi's account. Server returned: " + response.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Bhargavi login error:", err);
        setErrorMessage("Login error for Bhargavi's account: " + (err.message || "Unknown error"));
        setIsLoading(false);
      });
  };

  return (
    <div className="container1">
      <h1>Login to Portal</h1>
      <div className="mongodb-status">MongoDB Status: {mongoDbStatus}</div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {redirectCountdown !== null && (
        <div className="redirect-countdown">Redirecting in {redirectCountdown} seconds...</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
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
          <label htmlFor="password">Password</label>
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
          {isLoading ? "Logging in..." : "LOGIN"}
        </button>
      </form>
      <div className="register-link">
        <p>Don't have an account? <a href="/register">REGISTER</a></p>
      </div>
      <div className="forgot-password">
        <a href="/forgotpassword">Forgot Password?</a>
      </div>
      
      <div className="demo-accounts">
        <p>Quick Login:</p>
        <button 
          onClick={() => handleDirectLogin("test@example.com", "Success")}
          className="demo-btn"
          disabled={isLoading || redirectCountdown !== null}
        >
          Student Account
        </button>
        <button 
          onClick={() => handleDirectLogin("admin@example.com", "Admin")}
          className="demo-btn"
          disabled={isLoading || redirectCountdown !== null}
        >
          Admin Account
        </button>
      </div>
      
      <div className="real-account-login">
        <button 
          onClick={handleBhargaviLogin}
          className="special-btn"
          disabled={isLoading || redirectCountdown !== null}
        >
          Log in as Bhargavi
        </button>
      </div>
      
      {userData && (
        <div className="user-data">
          <h3>User Information</h3>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
          <p>Role: {userData.isAdmin ? "Admin" : "Student"}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
