import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig.js';
import {useNavigate} from 'react-router-dom'
import Navbar from '../HomeComponents/Navbar.js';
import Footer from '../HomeComponents/Footer.js';

function AddExperience() {
  const navigate=useNavigate()
  const [formData, setFormData] = useState({
    username:'',
    companyName: '',
    position: '',
    experience: '',
    interviewLevel: '',
    result: ''
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertColor, setAlertColor] = useState('');

  useEffect(() => {
    axios.get("/auth/verify").then((res) => {
      if (res.data.status) {
      } else {
        navigate("/interviewexperience");
      }
    });
  }, [navigate]);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/add-interview', formData);
      console.log(response.data);
      
      setFormData({
        username:'',
        companyName: '',
        position: '',
        experience: '',
        interviewLevel: '',
        result: ''
      });
      
      setAlertMessage('Interview experience added successfully!');
      setAlertColor('#28a745'); // Green success color
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/interviewexperience');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);      
      setAlertMessage('Error submitting your interview experience. Please try again.');
      setAlertColor('#dc3545'); // Red error color
    }
  };

  return (
    <>
  <Navbar/>
  <div style={{ maxWidth: '550px', margin: 'auto', fontFamily: 'Arial, sans-serif', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', height: 'fit-content',minHeight: '400px', overflowY: 'auto',marginTop:'80px' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: "2.5rem", color: "navy"  }}>Add Interview Experience</h2>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginBottom: '0.5rem', color: '#333' }}>Username:</label>
        <input type="text" name="username" value={formData.username} onChange={(e) => handleChange(e.target.name, e.target.value)} required style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '5px', width: '100%' }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginBottom: '0.5rem', color: '#333' }}>Company Name:</label>
        <input type="text" name="companyName" value={formData.companyName} onChange={(e) => handleChange(e.target.name, e.target.value)} required style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '5px', width: '100%' }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginBottom: '0.5rem', color: '#333' }}>Position:</label>
        <input type="text" name="position" value={formData.position} onChange={(e) => handleChange(e.target.name, e.target.value)} required style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '5px', width: '100%' }} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginBottom: '0.5rem', color: '#333' }}>Interview Experience:</label>
        <textarea
          value={formData.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          placeholder="Share your interview experience here..."
          style={{ 
            width: '100%', 
            minHeight: '200px', 
            padding: '0.5rem', 
            border: '1px solid #ccc', 
            borderRadius: '5px',
            fontFamily: 'Arial, sans-serif',
            resize: 'vertical'
          }}
          required
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginBottom: '0.5rem', color: '#333' }}>Interview Level:</label>
        <select name="interviewLevel" value={formData.interviewLevel} onChange={(e) => handleChange(e.target.name, e.target.value)} required style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '5px', width: '100%' }}>
          <option value="">Select Interview Level</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="difficult">Difficult</option>
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginBottom: '0.5rem', color: '#333' }}>Result:</label>
        <select name="result" value={formData.result} onChange={(e) => handleChange(e.target.name, e.target.value)} required style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '5px', width: '100%' }}>
          <option value="">Select Result</option>
          <option value="Successful">Successful</option>
          <option value="Rejected">Rejected</option>
          <option value="Waiting">Waiting</option>
        </select>
      </div>
      <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', alignSelf: 'center', width: 'fit-content' }}>Submit</button>
    </form>
    {alertMessage && <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: alertColor, color: '#fff', borderRadius: '5px', textAlign: 'center' }}>{alertMessage}</div>}
  </div>
  <Footer/>
</>  
  );
}

export default AddExperience;
