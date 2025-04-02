import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig.js";
import "./Profile-CSS/EditProfilePage.css"; // Ensure the path is correct

function EditProfile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    prn: "",
    rollNo: "",
    gender: "",
    dob: "",
    tenthPercentage: "",
    tenthSchool: "",
    twelfthPercentage: "",
    twelfthCollege: "",
    graduationCGPA: "",
    stream: "",
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);

  const navigate = useNavigate();

  // Fetch current user data on component mount
  useEffect(() => {
    axios
      .get("/auth/profile", { withCredentials: true }) 
      .then((response) => {
        if (response.data && response.data.user) {
          setUserData(response.data.user); // Pre-fill with fetched user data
          if (response.data.user.resume) {
            setCurrentResume(response.data.user.resume);
          }
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the profile data!", error);
      });
  }, []);

  // Handle form field change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Handle resume file change
  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData object to handle file upload
    const formData = new FormData();
    
    // Add all user data fields to the form data
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    
    // Add resume file if selected
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    
    axios
      .put("/profile/update-profile", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {
        alert("Profile updated successfully!");
        navigate("/profile"); // Redirect to profile page after successful update
      })
      .catch((error) => {
        console.error("There was an error updating the profile!", error);
      });
  };

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="form-control"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            placeholder="Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            type="text"
            id="contactNumber"
            className="form-control"
            name="contactNumber"
            value={userData.contactNumber}
            onChange={handleInputChange}
            placeholder="Contact Number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prn">PRN</label>
          <input
            type="text"
            id="prn"
            className="form-control"
            name="prn"
            value={userData.prn}
            onChange={handleInputChange}
            placeholder="PRN"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rollNo">Roll No</label>
          <input
            type="text"
            id="rollNo"
            className="form-control"
            name="rollNo"
            value={userData.rollNo}
            onChange={handleInputChange}
            placeholder="Roll No"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            className="form-control"
            name="gender"
            value={userData.gender}
            onChange={handleInputChange}
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
            name="dob"
            value={userData.dob}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tenthPercentage">10th Percentage</label>
          <input
            type="number"
            id="tenthPercentage"
            className="form-control"
            name="tenthPercentage"
            value={userData.tenthPercentage}
            onChange={handleInputChange}
            placeholder="10th Percentage"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tenthSchool">10th School Name</label>
          <input
            type="text"
            id="tenthSchool"
            className="form-control"
            name="tenthSchool"
            value={userData.tenthSchool}
            onChange={handleInputChange}
            placeholder="10th School"
          />
        </div>

        <div className="form-group">
          <label htmlFor="twelfthPercentage">12th Percentage</label>
          <input
            type="number"
            id="twelfthPercentage"
            className="form-control"
            name="twelfthPercentage"
            value={userData.twelfthPercentage}
            onChange={handleInputChange}
            placeholder="12th Percentage"
          />
        </div>

        <div className="form-group">
          <label htmlFor="twelfthCollege">12th College</label>
          <input
            type="text"
            id="twelfthCollege"
            className="form-control"
            name="twelfthCollege"
            value={userData.twelfthCollege}
            onChange={handleInputChange}
            placeholder="12th College"
          />
        </div>

        {userData.stream === "Computer Engineering" ? (
          <div className="form-group">
            <label htmlFor="graduationCGPA">Graduation CGPA</label>
            <input
              type="number"
              id="graduationCGPA"
              className="form-control"
              name="graduationCGPA"
              value={userData.graduationCGPA}
              onChange={handleInputChange}
              placeholder="Graduation CGPA"
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="sixthSemesterCGPA">6th Semester CGPA</label>
            <input
              type="number"
              id="sixthSemesterCGPA"
              className="form-control"
              name="sixthSemesterCGPA"
              value={userData.sixthSemesterCGPA}
              onChange={handleInputChange}
              placeholder="6th Semester CGPA"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="resume">Resume (PDF only)</label>
          <input
            type="file"
            id="resume"
            className="form-control"
            accept="application/pdf"
            onChange={handleResumeChange}
          />
          {currentResume && (
            <div className="current-resume">
              <p>Current Resume: {currentResume.filename}</p>
            </div>
          )}
        </div>

        <input type="submit" value="Update Profile" className="btn btn-primary" />
      </form>
    </div>
  );
}

export default EditProfile;
