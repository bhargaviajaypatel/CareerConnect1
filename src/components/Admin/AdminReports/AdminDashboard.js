import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosConfig.js";
import * as XLSX from "xlsx";
import "../Admin-CSS/AdminDashboard.css";
import Footer from "../AdminReusableComponents/AdminFooter.js";
import AdminHome from "../AdminHomeComponents/AdminHome.js";
import { FaDownload, FaFilter, FaRedo, FaGraduationCap, FaUsers, FaBuilding, FaUserCheck } from 'react-icons/fa';

function AdminDashboard() {
  const navigate = useNavigate();
  
  // Ensure Bootstrap JS is loaded for UI functionality
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
  
  useEffect(() => {
    // Check if user is authenticated and is an admin
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!isAuthenticated || userRole !== 'Admin') {
      console.log('Access denied: User is not authenticated as admin');
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
          console.log('Admin authentication verified for dashboard');
          // Authentication successful, will continue loading component
        } else {
          console.log('Server verification failed: Not admin');
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
  
  const [users, setUsers] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [originalUsers, setOriginalUsers] = useState([]);
  const [filters, setFilters] = useState({
    tenthPercentage: "",
    twelfthPercentage: "",
    graduationCGPA: "",
    placementStatus: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/auth/getUsers")
      .then((response) => {
        setUsers(response.data.data);
        setOriginalUsers(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Calculate stats for summary cards
  const totalUsers = originalUsers.length;
  const placedStudents = originalUsers.filter(user => user.placementStatus === "Placed").length;
  const totalStreams = [...new Set(originalUsers.map(user => user.stream))].filter(Boolean).length;
  const avgGPA = originalUsers.length > 0 
    ? (originalUsers.reduce((sum, user) => sum + (user.graduationCGPA || 0), 0) / originalUsers.length).toFixed(2)
    : 0;

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_data.xlsx");
  };

  const applyFilters = () => {
    let filteredUsers = originalUsers.filter((user) => {
      return (
        (!filters.tenthPercentage ||
          user.tenthPercentage >= parseFloat(filters.tenthPercentage)) &&
        (!filters.twelfthPercentage ||
          user.twelfthPercentage >= parseFloat(filters.twelfthPercentage)) &&
        (!filters.graduationCGPA ||
          user.graduationCGPA >= parseFloat(filters.graduationCGPA)) &&
        (!selectedProgram || user.stream === selectedProgram) &&
        (!filters.placementStatus ||
          user.placementStatus === filters.placementStatus)
      );
    });
    setUsers(filteredUsers);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };
  
  const resetFilters = () => {
    setFilters({
      tenthPercentage: "",
      twelfthPercentage: "",
      graduationCGPA: "",
      placementStatus: "",
    });
    setSelectedProgram("");
    setUsers(originalUsers);
  };

  const getStatusPill = (status) => {
    if (!status) return <span className="status-pill status-unplaced">Unplaced</span>;
    return status === "Placed" 
      ? <span className="status-pill status-placed">Placed</span>
      : <span className="status-pill status-unplaced">Unplaced</span>;
  };

  return (
    <>
      <AdminHome />
      <div className="dashboard-container">
        <h1 className="page-heading">User Reports</h1>
        
        {/* Summary Cards */}
        <div className="summary-container">
          <div className="summary-card card-blue">
            <div className="summary-icon"><FaUsers /></div>
            <h3>{totalUsers}</h3>
            <p>Total Students</p>
          </div>
          <div className="summary-card card-green">
            <div className="summary-icon"><FaUserCheck /></div>
            <h3>{placedStudents}</h3>
            <p>Placed Students</p>
          </div>
          <div className="summary-card card-orange">
            <div className="summary-icon"><FaGraduationCap /></div>
            <h3>{totalStreams}</h3>
            <p>Programs</p>
          </div>
          <div className="summary-card card-purple">
            <div className="summary-icon"><FaBuilding /></div>
            <h3>{avgGPA}</h3>
            <p>Avg. CGPA</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="tenthPercentage" className="filter-label">
              Filter by 10th Percentage:
            </label>
            <input
              type="number"
              id="tenthPercentage"
              name="tenthPercentage"
              value={filters.tenthPercentage}
              onChange={handleChange}
              className="filter-input"
              placeholder="Min percentage"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="twelfthPercentage" className="filter-label">
              Filter by 12th Percentage:
            </label>
            <input
              type="number"
              id="twelfthPercentage"
              name="twelfthPercentage"
              value={filters.twelfthPercentage}
              onChange={handleChange}
              className="filter-input"
              placeholder="Min percentage"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="graduationCGPA" className="filter-label">
              Filter by Graduation CGPA:
            </label>
            <input
              type="number"
              id="graduationCGPA"
              name="graduationCGPA"
              value={filters.graduationCGPA}
              onChange={handleChange}
              className="filter-input"
              placeholder="Min CGPA"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="stream" className="filter-label">
              Filter by Program:
            </label>
            <select
              id="stream"
              name="stream"
              value={selectedProgram}
              onChange={handleProgramChange}
              className="filter-input"
            >
              <option value="">Select Stream</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electronics and Computer Science">Electronics and Computer Science</option>
              <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="placementStatus" className="filter-label">
              Filter by Placement Status:
            </label>
            <select
              id="placementStatus"
              name="placementStatus"
              value={filters.placementStatus}
              onChange={handleChange}
              className="filter-input"
            >
              <option value="">Select Status</option>
              <option value="Placed">Placed</option>
              <option value="Unplaced">Unplaced</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="filter-group">
            <div className="buttons-container">
              <button onClick={applyFilters} className="filter-button">
                <FaFilter /> Apply Filters
              </button>
              <button onClick={resetFilters} className="filter-button">
                <FaRedo /> Reset
              </button>
              <button onClick={handleDownload} className="download-button">
                <FaDownload /> Download Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Data Table */}
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading student data...</p>
          </div>
        ) : (
          users.length > 0 ? (
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>PRN</th>
                    <th>Roll No</th>
                    <th>Stream</th>
                    <th>10th %</th>
                    <th>12th %</th>
                    <th>Graduation CGPA</th>
                    <th>Status</th>
                    <th>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="highlight-cell">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.contactNumber}</td>
                      <td>{user.prn || "N/A"}</td>
                      <td>{user.rollNo || "N/A"}</td>
                      <td>{user.stream || "N/A"}</td>
                      <td>{user.tenthPercentage || "N/A"}</td>
                      <td>{user.twelfthPercentage || "N/A"}</td>
                      <td>{user.graduationCGPA || "N/A"}</td>
                      <td>{getStatusPill(user.placementStatus)}</td>
                      <td>{user.companyPlaced || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No matching records found</h3>
              <p>Try adjusting your filters or click Reset to see all records</p>
              <button onClick={resetFilters} className="filter-button mt-3">
                <FaRedo /> Reset Filters
              </button>
            </div>
          )
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdminDashboard;
