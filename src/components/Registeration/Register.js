import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig.js";
import "./Registeration-CSS/RegistrationPage.css"; // Updated CSS file name

function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repass, setRpass] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [prn, setprn] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [tenthPercentage, setTenthPercentage] = useState("");
  const [tenthSchool, setTenthSchool] = useState("");
  const [twelfthPercentage, setTwelfthPercentage] = useState("");
  const [twelfthCollege, setTwelfthCollege] = useState("");
  const [sixthSemesterCGPA, setSixthSemesterCGPA] = useState("");
  const [graduationCGPA, setGraduationCGPA] = useState("");
  const [stream, setStream] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  
  // Career preferences state variables
  const [interestedCompanies, setInterestedCompanies] = useState("");
  const [interestedRoles, setInterestedRoles] = useState("");
  const [interestedSkills, setInterestedSkills] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== repass) {
      alert("Passwords do not match");
      return;
    }
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      alert(
        "Password should contain at least one uppercase, one lowercase, one special character, and one number, with a minimum length of 8 characters."
      );
      return;
    }

    if (
      !name ||
      !email ||
      !password ||
      !repass ||
      !contactNumber ||
      !prn ||
      !rollNo ||
      !gender ||
      !dob ||
      !tenthPercentage ||
      !tenthSchool ||
      !twelfthPercentage ||
      !twelfthCollege ||
      (stream === "Computer Engineering" && !graduationCGPA) ||
      !stream ||
      (stream !== "Computer Engineering" && !sixthSemesterCGPA)
    ) {
      alert("Please fill in all fields");
      return;
    }

    // Create FormData object to handle file upload
    const formData = new FormData();
    
    // Add all user data fields to the form data
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('contactNumber', contactNumber);
    formData.append('sapId', prn);
    formData.append('rollNo', rollNo);
    formData.append('gender', gender);
    formData.append('dob', dob);
    formData.append('tenthPercentage', tenthPercentage);
    formData.append('tenthSchool', tenthSchool);
    formData.append('twelfthPercentage', twelfthPercentage);
    formData.append('twelfthCollege', twelfthCollege);
    formData.append('graduationCGPA', stream === "Computer Engineering" ? graduationCGPA : null);
    formData.append('sixthSemesterCGPA', stream !== "Computer Engineering" ? sixthSemesterCGPA : null);
    formData.append('stream', stream);
    formData.append('isAdmin', false);
    
    // Add career preferences
    formData.append('interestedCompanies', interestedCompanies);
    formData.append('interestedRoles', interestedRoles);
    formData.append('interestedSkills', interestedSkills);
    formData.append('careerGoals', careerGoals);
    
    // Add resume file if selected
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    
    axiosInstance
      .post("/auth/register", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((result) => {
        console.log(result);
        if (result.data && result.data.message) {
          // Check if user already exists message
          if (result.data.message === "User already existed") {
            alert("Account with this email already exists. Please login instead.");
            navigate("/login");
          } else if (result.data.message === "User Registered") {
            // Show success message and redirect to login
            alert("Registration successful! Please login with your credentials.");
            navigate("/login");
          } else {
            // Any other success message
            alert(result.data.message);
            navigate("/login");
          }
        } else {
          // Fallback if response structure is unexpected
          alert("Registration successful!");
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("Registration error:", err);
        if (err.response && err.response.data && err.response.data.message) {
          // Show specific error message from server
          alert("Registration failed: " + err.response.data.message);
        } else if (err.message === "Network Error") {
          // Network-related errors
          alert("Network error. Please check your connection and try again.");
        } else {
          // Generic error message as fallback
          alert("Registration failed. Please try again later.");
        }
      });
  };

  const handleStreamChange = (e) => {
    setStream(e.target.value);

    setGraduationCGPA("");
    setSixthSemesterCGPA("");
  };
  
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    
    // Basic validation for file type and size
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please choose a smaller file.");
        e.target.value = null; // Reset the input
        return;
      }
      
      // Check file type (prefer PDF)
      if (!file.type.includes('pdf') && !file.type.includes('document')) {
        const proceed = window.confirm("We recommend PDF format for resumes. Continue with this file format?");
        if (!proceed) {
          e.target.value = null; // Reset the input
          return;
        }
      }
      
      setResumeFile(file);
    }
  };

  return (
    <div className="registration-container"> 
      <h1>Registration Page</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="form-control"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            className="form-control"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="repass">Re-enter Password</label>
          <input
            type="password"
            id="repass"
            className="form-control"
            placeholder="Re-enter Password"
            autoComplete="new-password"
            onChange={(e) => setRpass(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tenthPercentage">10th Percentage</label>
          <input
            type="number"
            id="tenthPercentage"
            className="form-control"
            placeholder="10th Percentage"
            step="0.01"
            onChange={(e) => setTenthPercentage(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tenthSchool">School Name</label>
          <input
            type="text"
            id="tenthSchool"
            className="form-control"
            placeholder="10th Standard School Name"
            onChange={(e) => setTenthSchool(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="twelfthPercentage">12th Percentage</label>
          <input
            type="number"
            id="twelfthPercentage"
            className="form-control"
            placeholder="12th Percentage"
            step="0.01"
            onChange={(e) => setTwelfthPercentage(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="twelfthCollege">12th Standard College Name</label>
          <input
            type="text"
            id="twelfthCollege"
            className="form-control"
            placeholder="12th Standard College Name"
            onChange={(e) => setTwelfthCollege(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="stream">Stream</label>
          <select
            id="stream"
            className="form-control"
            onChange={handleStreamChange}
          >
            <option value="">Select Stream</option>
            <option value="">Select Stream</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electronics and Computer Science">Electronics and Computer Science</option>
              <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
        </div>
        {stream === "MCA" ? (
          <div className="form-group">
            <label htmlFor="graduationCGPA">Graduation CGPA</label>
            <input
              type="number"
              id="graduationCGPA"
              className="form-control"
              placeholder="Graduation CGPA"
              step="0.01"
              onChange={(e) => setGraduationCGPA(e.target.value)}
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="sixthSemesterCGPA">6th Semester CGPA</label>
            <input
              type="number"
              id="sixthSemesterCGPA"
              className="form-control"
              placeholder="6th Semester CGPA"
              step="0.01"
              onChange={(e) => setSixthSemesterCGPA(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            type="number"
            id="contactNumber"
            className="form-control"
            placeholder="Contact Number"
            onChange={(e) => setContactNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="prn">PRN</label>
          <input
            type="text"
            id="prn"
            className="form-control"
            placeholder="PRN"
            onChange={(e) => setprn(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="rollNo">Roll No</label>
          <input
            type="text"
            id="rollNo"
            className="form-control"
            placeholder="Roll No"
            onChange={(e) => setRollNo(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            className="form-control"
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            className="form-control"
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        
        {/* Career Preferences Section */}
        <div className="form-section">
          <h2 className="section-title">Career Preferences</h2>
          <p className="section-description">
            Tell us about your career interests to help us provide personalized roadmaps and resources.
          </p>
          
          <div className="form-group">
            <label htmlFor="interestedCompanies">Companies You're Interested In</label>
            <input
              type="text"
              id="interestedCompanies"
              className="form-control"
              placeholder="E.g., Google, Microsoft, Amazon (comma-separated)"
              onChange={(e) => setInterestedCompanies(e.target.value)}
            />
            <small className="form-text text-muted">Separate multiple companies with commas</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="interestedRoles">Job Roles You're Interested In</label>
            <input
              type="text"
              id="interestedRoles"
              className="form-control"
              placeholder="E.g., Software Engineer, Data Scientist, UI Designer (comma-separated)"
              onChange={(e) => setInterestedRoles(e.target.value)}
            />
            <small className="form-text text-muted">Separate multiple roles with commas</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="interestedSkills">Skills You Want to Develop</label>
            <input
              type="text"
              id="interestedSkills"
              className="form-control"
              placeholder="E.g., React, Machine Learning, Cloud Computing (comma-separated)"
              onChange={(e) => setInterestedSkills(e.target.value)}
            />
            <small className="form-text text-muted">Separate multiple skills with commas</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="careerGoals">Career Goals</label>
            <textarea
              id="careerGoals"
              className="form-control"
              placeholder="Briefly describe your short and long-term career goals"
              rows="3"
              onChange={(e) => setCareerGoals(e.target.value)}
            ></textarea>
          </div>
        </div>
        
        {/* Resume Upload Section */}
        <div className="form-group">
          <label htmlFor="resume">Upload Resume (Optional)</label>
          <input
            type="file"
            id="resume"
            className="form-control-file"
            onChange={handleResumeChange}
          />
          <small className="form-text text-muted">PDF format recommended, max size 5MB</small>
        </div>
        
        <button type="submit" className="btn btn-primary">Register</button>
        <div>
          <p>Already a user?</p>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Registration;
