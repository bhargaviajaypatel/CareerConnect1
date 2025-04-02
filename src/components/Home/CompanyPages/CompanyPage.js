import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axiosConfig.js";
import { useDispatch, useSelector } from "react-redux";
import { getCompanies } from "../../../redux/companySlice.jsx";
import Footer from "../HomeComponents/Footer.js";
import Navbar from "../HomeComponents/Navbar.js";
import ApplyJobs from "../Assets/applyjobs.png"
function CompanyPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGPA, setCurrentGPA] = useState(null);
  const companies = useSelector((state) => state.companies.companies);
  useEffect(() => {
    console.log("==========================");
    
    console.log(currentUser);
    console.log("==========================");
    
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/auth/getCompanies/${id}`
        );
        dispatch(getCompanies(response.data));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [dispatch, id, currentUser]);

  useEffect(() => {
    axios.get("/auth/verify").then((res) => {
      if (!res.data.status) {
        navigate("/");
      }
    });

    // Get the userId or email from localStorage
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    axios
      .get(`/auth/currentUser?${userId ? 'userId=' + userId : 'email=' + userEmail}`)
      .then((res) => {
        setCurrentUser(res.data.user);
        console.log(res.data.user);
        setCurrentGPA(res.data.user.sixthSemesterCGPA);
      })
      .catch((err) => {
        console.error("Error fetching current user:", err);
      });
  }, [navigate]);

  const handleApply = async (companyId, userId) => {
    try {
      console.log(currentGPA);
      
      // get target company
      const company = companies.find((company) => company._id === companyId);
      console.log(company.sixthSemesterCGPA);
      
      // check if user has enough cgpa
      if (currentGPA < company.sixthSemesterCGPA) {
        alert("You do not have enough CGPA to apply to this company");
        return;
      }

      const response = await axios.post(
        `/auth/applyCompany/${userId}/${id}`
      );
      alert(response.data.message);

      const updatedResponse = await axios.get(
        `/auth/getCompanies/${id}`
      );
      dispatch(getCompanies(updatedResponse.data));
      navigate("/scheduledInterview");
    } catch (error) {
      console.error(error);
      alert("Error applying to company");
    }
  };

  return (
    <>
    <Navbar/>
    <h1 className="page-title" style={{textAlign:"center", marginTop:"150px", color:"navy", fontSize: "clamp(2rem, 5vw, 3rem)"}}>Apply Jobs</h1>
    <div
  className="company-list-container"
  style={{ 
    padding: "20px", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    gap: "30px",
    "@media (min-width: 992px)": {
      flexDirection: "row",
      alignItems: "flex-start"
    }
  }}
>
  {/* Image */}
  <div style={{ 
    width: "100%", 
    maxWidth: "500px",
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
    order: 2,
    "@media (min-width: 992px)": {
      flex: "0 0 45%",
      order: 1,
      marginRight: "30px"
    }
  }}>
    <img
      src={ApplyJobs}
      alt="Apply Job"
      style={{
        width: "100%",
        maxWidth: "350px",
        height: "auto",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s ease",
        "@media (min-width: 992px)": {
          maxWidth: "500px"
        }
      }}
    />
  </div>

  {/* Card View */}
  <div style={{ 
    width: "100%", 
    display: "flex", 
    flexDirection: "column",
    order: 1,
    "@media (min-width: 992px)": {
      flex: "0 0 50%",
      order: 2
    }
  }}>
    {companies.map((company) => (
      <div
        key={company.id}
        className="company-card"
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden", // Hide overflowing content
        }}
      >
        <h1
          className="company-name"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            marginBottom: "20px",
            textAlign: "center",
            color:"#007bff",
          }}
        >
          {company.companyname}
        </h1>
        <div className="company-info" style={{ marginBottom: "20px" }}>
          <p style={{ color: "#333", fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "10px" }}>
            <strong>CTC:</strong> {company.ctc} LPA
          </p>
          <p style={{ color: "#333", fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "10px" }}>
            <strong>Interview Date:</strong> {company.doi}
          </p>
          <p style={{ color: "#333", fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "10px" }}>
            <strong>Job Description:</strong> {company.jobdescription}
          </p>
          <p style={{ color: "#333", fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "10px" }}>
            <strong>Eligibility Criteria</strong> <br></br>
            <strong>10th Percentage:</strong> {company.tenthPercentage}<br></br>
            <strong>12th Percentage:</strong> {company.twelfthPercentage}<br></br>
            <strong>Graduation CGPA:</strong> {company.graduationCGPA}
          </p>
          <p style={{ color: "#333", fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "10px" }}>
            <strong>Job Description:</strong> 
            {company.eligibilityCriteria
                ? company.eligibilityCriteria.join(", ")
                : ""}
            <p style={{ color: "#333", fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "10px" }}>
            <strong>6th Semester CGPA:</strong> {company.sixthSemesterCGPA}

          </p>

          </p>
          
        </div>
        {/* Apply Button */}
        <button
          onClick={() => handleApply(company._id, currentUser._id)}
          className="apply-btn"
          style={{
            backgroundColor: "#001f3f",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            fontSize: "clamp(1rem, 3vw, 1.5rem)",
            width: "100%",
            maxWidth: "300px",
            margin: "0 auto",
            display: "block",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s ease, background-color 0.3s ease",
          }}
        >
          Apply Now
        </button>
      </div>
    ))}
  </div>
</div>

    <Footer/>
    </>
  );
}

export default CompanyPage;
