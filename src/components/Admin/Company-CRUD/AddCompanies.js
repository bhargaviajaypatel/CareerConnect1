import { useState } from "react";
import React, { useEffect } from "react";
import axios from "../../../api/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import "../Admin-CSS/AddCompanies.css";
import AdminHome from "../AdminHomeComponents/AdminHome.js";
import Footer from "../AdminReusableComponents/AdminFooter.js";
import AddCompany from '../Assets/AddCompany.png'

function AddCompanies() {
  const [companyname, setCompanyName] = useState("");
  const [jobprofile, setJobProfile] = useState("");
  const [jobdescription, setJobDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [ctc, setCtc] = useState("");
  const [doi, setDoi] = useState("");
  const [tenthPercentage, setTenthPercentage] = useState("");
  const [twelfthPercentage, setTwelfthPercentage] = useState("");
  const [sixthSemesterCGPA, setSixthSemesterCGPA] = useState("");
  const [graduationCGPA, setGraduationCGPA] = useState("");
  const [branches, setBranches] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState("");
  const [rolesAndResponsibilities, setRolesAndResponsibilities] = useState("");
  const [auth, setAuth] = useState(false);

  const navigate = useNavigate();

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
    axios.get("/auth/verify", {
      params: { email: userEmail },
      headers: { 'user-email': userEmail }
    })
      .then(response => {
        if (response.data === 'Admin') {
          console.log('Admin authentication verified');
          setAuth(true);
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

  const handleBranchChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setBranches((prevBranches) => [...prevBranches, value]);
    } else {
      setBranches((prevBranches) =>
        prevBranches.filter((branch) => branch !== value)
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !companyname ||
      !jobprofile ||
      !jobdescription ||
      !website ||
      !doi ||
      !tenthPercentage ||
      !ctc ||
      !twelfthPercentage
    ) {
      alert("Please fill in all fields");
      return;
    }

    const CompanyData = {
      companyname,
      jobprofile,
      jobdescription,
      website,
      ctc,
      doi,
      eligibilityCriteria: branches,
      tenthPercentage,
      twelfthPercentage,
      graduationCGPA,
      sixthSemesterCGPA,
      requiredSkills: requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
      rolesAndResponsibilities: rolesAndResponsibilities.split('\n').map(role => role.trim()).filter(role => role !== '')
    };

    axios
      .post("/auth/add-companies", CompanyData)
      .then((result) => {
        console.log(result);
        navigate("/companies");
      })
      .catch((err) => {
        console.error("Error submitting data:", err);
      });
  };

  return (
    <>
      {auth ? (
        <>
          <AdminHome/>
          <h1 style={{marginTop:'90px',color: 'navy'}}>Add Companies</h1>
          <div className="container-fluid h-100">
            <div className="row h-100 justify-content-center align-items-start">
              {/* Image column */}
              <div className="col-lg-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px', marginTop:'120px'}}>
                <img src={AddCompany} alt="Company form illustration" className="img-fluid" style={{ maxWidth: '120%', maxHeight: '120%',marginLeft:'100px' }} />
              </div>

              {/* Form column */}
              <div className="col-lg-8 d-flex justify-content-center align-items-center custom-border">
                <div className="form-container">
                  <div className="card" style={{maxWidth:"100vh",width:"900%"}}>
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <table className="table">
                          <tbody>
                            <tr>
                              <td>
                                <div className="form-group">
                                  <label htmlFor="name">Company Name</label>
                                  <input
                                    type="text"
                                    id="name"
                                    className="form-control"
                                    placeholder="Company Name"
                                    onChange={(e) => setCompanyName(e.target.value)}
                                  />
                                </div>
                              
                                <div className="form-group">
                                  <label htmlFor="jobprofile">Job Profile</label>
                                  <input
                                    type="text"
                                    id="jobprofile"
                                    className="form-control"
                                    placeholder="Job Profile"
                                    onChange={(e) => setJobProfile(e.target.value)}
                                  />
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div className="form-group">
                                  <label htmlFor="jobdescription">Job Description</label>
                                  <textarea
                                    id="jobdescription"
                                    className="form-control textarea"
                                    placeholder="Job Description"
                                    onChange={(e) => setJobDescription(e.target.value)}
                                  />
                                </div>
                              
                                <div className="form-group">
                                  <label htmlFor="website">Company Website</label>
                                  <input
                                    type="website"
                                    id="website"
                                    className="form-control"
                                    placeholder="Company Website"
                                    onChange={(e) => setWebsite(e.target.value)}
                                  />
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div className="form-group">
                                  <label htmlFor="ctc">Offered CTC</label>
                                  <input
                                    type="number"
                                    id="ctc"
                                    className="form-control"
                                    placeholder="Offered CTC"
                                    onChange={(e) => setCtc(e.target.value)}
                                  />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="interviewdate">Interview Date</label>
                                  <input
                                    type="date"
                                    id="interviewdate"
                                    className="form-control"
                                    onChange={(e) => setDoi(e.target.value)}
                                  />
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <h4 className="mb-3">Eligibility Criteria</h4>
                                <div className="form-group">
                                  <label htmlFor="MCA">
                                    <input
                                      type="checkbox"
                                      id="MCA"
                                      value="MCA"
                                      onChange={handleBranchChange}
                                    />
                                    MCA
                                  </label>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="BTECH-IT">
                                    <input
                                      type="checkbox"
                                      id="BTECH-IT"
                                      value="BTECH-IT"
                                      onChange={handleBranchChange}
                                    />
                                    Btech-IT
                                  </label>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="BTECH-CS">
                                    <input
                                      type="checkbox"
                                      id="BTECH-CS"
                                      value="BTECH-CS"
                                      onChange={handleBranchChange}
                                    />
                                    Btech-CS
                                  </label>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="BTECH-CYBERSECURITY">
                                    <input
                                      type="checkbox"
                                      id="BTECH-CYBERSECURITY"
                                      value="BTECH-CYBERSECURITY"
                                      onChange={handleBranchChange}
                                    />
                                    Btech-Cybersecurity
                                  </label>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="BTECH-DATA SCIENCE">
                                    <input
                                      type="checkbox"
                                      id="BTECH-DATA SCIENCE"
                                      value="BTECH-DATA SCIENCE"
                                      onChange={handleBranchChange}
                                    />
                                    Btech-Data Science
                                  </label>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="BTECH-INTEGRATED">
                                    <input
                                      type="checkbox"
                                      id="BTECH-INTEGRATED"
                                      value="BTECH-INTEGRATED"
                                      onChange={handleBranchChange}
                                    />
                                    Btech-Integrated
                                  </label>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="BTECH-MECHATRONICS">
                                    <input
                                      type="checkbox"
                                      id="BTECH-MECHATRONICS"
                                      value="BTECH-MECHATRONICS"
                                      onChange={handleBranchChange}
                                    />
                                    Btech-Mechatronics
                                  </label>
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
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div className="form-group">
                                  <label htmlFor="rolesAndResponsibilities">Roles and Responsibilities</label>
                                  <textarea
                                    id="rolesAndResponsibilities"
                                    className="form-control"
                                    placeholder="Enter each role and responsibility on a new line"
                                    rows="5"
                                    onChange={(e) => setRolesAndResponsibilities(e.target.value)}
                                  />
                                  <small className="form-text text-muted">Each line will be treated as a separate responsibility.</small>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="requiredSkills">Required Skills (comma-separated)</label>
                                  <textarea
                                    id="requiredSkills"
                                    className="form-control"
                                    placeholder="e.g. JavaScript, React, Node.js"
                                    onChange={(e) => setRequiredSkills(e.target.value)}
                                  />
                                  <small className="form-text text-muted">These skills will be used to generate learning roadmaps for students.</small>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="text-center">
                        <input type="submit" value="Submit" className="btn btn-primary" />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer/>
        </>
      ) : (
        <div className="container text-center mt-5 pt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Verifying authentication...</p>
        </div>
      )}
    </>
  );
}

export default AddCompanies;
