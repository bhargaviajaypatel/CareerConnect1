import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosConfig.js";
import Footer from "../HomeComponents/Footer.js";
import emptyStateImage from '../Assets/scheduleding.png';
import '../Home-CSS/Application.css';
import '../Home-CSS/ScheduledInterview.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ScheduledInterview() {
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [checklist, setChecklist] = useState({});
  const [countdown, setCountdown] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define getCountdownValue function at the beginning of the component
  const getCountdownValue = (interviewDate, label) => {
    const interview = new Date(interviewDate);
    const now = new Date();
    const diff = Math.max(0, interview - now);
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    switch(label) {
      case 'Days': return days;
      case 'Hours': return hours;
      case 'Mins': return minutes;
      case 'Secs': return seconds;
      default: return 0;
    }
  };

  useEffect(() => {
    // Get the userId or email from localStorage
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated || !userEmail) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    
    // Create a mock user for testing
    const mockUser = {
      _id: userId || 'mock-user-id',
      name: 'Test User',
      email: userEmail || 'test@example.com'
    };
    console.log("Using mock user:", mockUser);
    setCurrentUser(mockUser);
    
    // Fetch interviews when user is set
    if (mockUser) {
      fetchScheduledInterviews();
    }
  }, [navigate]); // Remove fetchScheduledInterviews from dependencies to prevent flickering

  // Modified to use direct mock data with all possible interview scenarios
  const fetchScheduledInterviews = useCallback(() => {
    console.log("Fetching scheduled interviews...");
    setLoading(true);
    
    // Try to get real data from API first
    axios.get('/auth/getScheduledInterviews')
      .then(response => {
        if (response.data && Array.isArray(response.data.interviews) && response.data.interviews.length > 0) {
          console.log("Got real interview data from API:", response.data.interviews);
          processInterviewData(response.data.interviews);
        } else {
          throw new Error("No real interview data available");
        }
      })
      .catch(error => {
        console.log("Using mock interview data due to API error:", error);
        createMockInterviewData();
      });
    
    // Function to process interview data (real or mock)
    const processInterviewData = (interviews) => {
      const today = new Date();
      
      // Process and categorize interviews
      const processedInterviews = interviews.map(interview => {
        const interviewDate = new Date(interview.interviewDate);
        let status = 'upcoming';
        
        // Determine if interview is today, upcoming, or past
        if (interviewDate.toDateString() === today.toDateString()) {
          status = 'today';
        } else if (interviewDate < today) {
          status = 'past';
        }
        
        return {
          ...interview,
          status
        };
      });
      
      setScheduledInterviews(processedInterviews);
      initializeCountdown(processedInterviews);
      setLoading(false);
    };
    
    // Create mock interview data based on applied companies
    const createMockInterviewData = () => {
      const today = new Date();
      
      // Create realistic mock data for UI display with various scenarios
      const mockInterviews = [
        {
          _id: 'mock-interview-1',
          companyName: 'Tata Consultancy Services',
          role: 'Software Engineer',
          ctc: '18 LPA',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30), // Today at 2:30 PM
          formattedDate: today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          formattedTime: '2:30 PM',
          fullDateDisplay: `${today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at 2:30 PM`,
          interviewType: 'Technical',
          interviewMode: 'Virtual',
          interviewerName: 'Rajesh Kumar',
          location: 'Google Meet',
          duration: '1 hour',
          description: 'This technical interview will focus on Java, Spring Boot, and microservices architecture. Be prepared to discuss your experience with RESTful APIs and database design.',
          requiredSkills: ['Java', 'Spring Boot', 'React', 'Microservices', 'SQL'],
          status: 'today'
        },
        {
          _id: 'mock-interview-2',
          companyName: 'Infosys',
          role: 'Full Stack Developer',
          ctc: '21 LPA',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0), // 3 days from now at 11:00 AM
          formattedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          formattedTime: '11:00 AM',
          fullDateDisplay: `${new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at 11:00 AM`,
          interviewType: 'Technical + HR',
          interviewMode: 'In-person',
          interviewerName: 'Priya Sharma',
          location: 'Infosys Campus, Building 3',
          duration: '1.5 hours',
          description: 'This interview will consist of a technical round followed by an HR discussion. The technical portion will focus on JavaScript, Angular, and Node.js development.',
          requiredSkills: ['JavaScript', 'Angular', 'Node.js', 'MongoDB', 'AWS'],
          status: 'upcoming'
        },
        {
          _id: 'mock-interview-3',
          companyName: 'Wipro',
          role: 'Database Administrator',
          ctc: '16 LPA',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 10, 0), // 7 days from now at 10:00 AM
          formattedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          formattedTime: '10:00 AM',
          fullDateDisplay: `${new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at 10:00 AM`,
          interviewType: 'Technical',
          interviewMode: 'Virtual',
          interviewerName: 'Anil Patel',
          location: 'Microsoft Teams',
          duration: '1 hour',
          description: 'This technical interview will assess your knowledge of database management, SQL optimization, and data warehousing concepts.',
          requiredSkills: ['SQL', 'Oracle', 'Database Management', 'Data Warehousing'],
          status: 'upcoming'
        },
        {
          _id: 'mock-interview-4',
          companyName: 'HCL Technologies',
          role: 'Data Scientist',
          ctc: '19 LPA',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 14, 30), // 5 days ago at 2:30 PM
          formattedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          formattedTime: '2:30 PM',
          fullDateDisplay: `${new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at 2:30 PM`,
          interviewType: 'Technical',
          interviewMode: 'In-person',
          interviewerName: 'Vikram Singh',
          location: 'HCL Office, Noida',
          duration: '1.5 hours',
          description: 'This interview focused on machine learning algorithms, data visualization techniques, and statistical analysis.',
          requiredSkills: ['Python', 'Machine Learning', 'Data Visualization', 'Statistics'],
          status: 'past',
          outcome: 'Advanced to Final Round'
        },
        {
          _id: 'mock-interview-5',
          companyName: 'Tech Mahindra',
          role: 'DevOps Engineer',
          ctc: '17 LPA',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 11, 0), // 10 days ago at 11:00 AM
          formattedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          formattedTime: '11:00 AM',
          fullDateDisplay: `${new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at 11:00 AM`,
          interviewType: 'Technical + HR',
          interviewMode: 'Virtual',
          interviewerName: 'Neha Gupta',
          location: 'Zoom',
          duration: '2 hours',
          description: 'This interview covered CI/CD pipelines, containerization technologies, and cloud infrastructure management.',
          requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Jenkins'],
          status: 'past',
          outcome: 'Offer Received'
        }
      ];
      
      // Process and categorize all interviews
      processInterviewData(mockInterviews);
    };
    
    // Initialize countdown for all interviews
    const initializeCountdown = (interviews) => {
      const countdownObj = {};
      
      interviews.forEach(interview => {
        if (interview.status !== 'past') {
          countdownObj[interview._id] = {
            days: getCountdownValue(interview.interviewDate, 'Days'),
            hours: getCountdownValue(interview.interviewDate, 'Hours'),
            minutes: getCountdownValue(interview.interviewDate, 'Mins'),
            seconds: getCountdownValue(interview.interviewDate, 'Secs')
          };
        }
      });
      
      setCountdown(countdownObj);
      
      // Initialize checklist for each interview
      const checklistObj = {};
      interviews.forEach(interview => {
        checklistObj[interview._id] = {
          'Research Company': false,
          'Prepare Resume': false,
          'Practice Common Questions': false,
          'Prepare Questions to Ask': false,
          'Plan Interview Outfit': false,
          'Check Technical Setup': interview.interviewMode === 'Virtual'
        };
      });
      
      setChecklist(checklistObj);
    };
    
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchScheduledInterviews();
    }
  }, [currentUser, fetchScheduledInterviews]);

  // Single countdown timer effect
  useEffect(() => {
    // Update countdown timers every second
    const interval = setInterval(() => {
      if (scheduledInterviews && scheduledInterviews.length > 0) {
        const newCountdown = {};
        let updated = false;
        
        scheduledInterviews.forEach(interview => {
          if (interview.status === 'past') {
            newCountdown[interview._id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return;
          }
          
          newCountdown[interview._id] = {
            days: getCountdownValue(interview.interviewDate, 'Days'),
            hours: getCountdownValue(interview.interviewDate, 'Hours'),
            minutes: getCountdownValue(interview.interviewDate, 'Mins'),
            seconds: getCountdownValue(interview.interviewDate, 'Secs')
          };
          updated = true;
        });
        
        if (updated) {
          setCountdown(newCountdown);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [scheduledInterviews]);

  // Handle navigation functions
  const handleNavigation = (path) => {
    console.log("Navigating to:", path);
    // Check if we're navigating to the placement material page
    if (path === '/faq') {
      // Redirect /faq to /placement-material
      path = '/placement-material';
    }
    
    // Use regular navigation for all paths
    navigate(path);
  };

  const toggleCardExpand = (interviewId) => {
    setExpandedCards(prev => ({
      ...prev,
      [interviewId]: !prev[interviewId]
    }));
  };
  
  const handleChecklistItem = (interviewId, item) => {
    setChecklist(prev => ({
      ...prev,
      [interviewId]: {
        ...prev[interviewId],
        [item]: !prev[interviewId]?.[item]
      }
    }));
  };
  
  const addToCalendar = (interview) => {
    const { companyName, interviewDate } = interview;
    
    // Format for Google Calendar
    const startTime = new Date(interviewDate).toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = new Date(new Date(interviewDate).getTime() + 60*60*1000).toISOString().replace(/-|:|\.\d+/g, '');
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview with ${companyName}`)}&dates=${startTime}/${endTime}&details=${encodeURIComponent('Job Interview scheduled through CareerConnect')}`;
    
    window.open(googleCalUrl, '_blank');
  };
  
  const getCompanyInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const countdownComponents = [
    { label: 'Days', value: 0 },
    { label: 'Hours', value: 0 },
    { label: 'Mins', value: 0 },
    { label: 'Secs', value: 0 }
  ];

  // Helper function to render interview sections
  const renderInterviewSection = (status, title) => {
    const filteredInterviews = scheduledInterviews?.filter(
      interview => interview.status.toLowerCase() === status
    ) || [];
    
    console.log(`${status} interviews:`, filteredInterviews.length, filteredInterviews);
    
    // Only render the section if there are interviews or if it's for debugging
    if (filteredInterviews.length === 0) {
      return null;
    }
    
    return (
      <div key={status} className="interview-section">
        <div className={`status-heading ${status}`}>
          {status === 'today' && (
            <span className="badge bg-warning me-2">Today</span>
          )}
          {title} <span className="ms-2 small">({filteredInterviews.length})</span>
        </div>
        
        {filteredInterviews.map(interview => (
          <div key={interview._id} className={`interview-card ${status}`}>
            {/* Status Badge */}
            <span className={`status-badge ${status}-badge`}>
              {status === 'upcoming' ? 'UPCOMING' : status.toUpperCase()}
            </span>
            
            <div className="card-content">
              <div className="d-flex align-items-center">
                <div className={`company-initials ${status} me-3`}>
                  {getCompanyInitials(interview.companyName)}
                </div>
                <div className="interview-info flex-grow-1">
                  <h5>{interview.companyName}</h5>
                  <div className="text-muted small mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-briefcase me-1" viewBox="0 0 16 16">
                      <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zM0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85z"/>
                    </svg>
                    {interview.role} {interview.ctc && `• ${interview.ctc}`}
                  </div>
                  <div className="text-muted small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar me-1" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                    {interview.fullDateDisplay || `${interview.formattedDate} at ${interview.formattedTime}`}
                  </div>
                  <div className="mt-2 d-flex align-items-center flex-wrap">
                    <span className="badge rounded-pill bg-light text-dark me-2 mb-1">
                      {interview.interviewType}
                    </span>
                    <span className="badge rounded-pill bg-light text-dark mb-1">
                      {interview.interviewMode}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* View/Hide Details Button */}
              <div className="text-center mt-3">
                <button 
                  className="btn btn-primary btn-sm rounded-pill px-4"
                  onClick={() => toggleCardExpand(interview._id)}
                >
                  {expandedCards[interview._id] ? (
                    <span>Hide Details <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                    </svg></span>
                  ) : (
                    <span>View Details <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg></span>
                  )}
                </button>
              </div>
              
              {/* Expanded Details Section */}
              {expandedCards[interview._id] && (
                <div className="details-section">
                  {/* Countdown timer for upcoming and today interviews */}
                  {(status === 'upcoming' || status === 'today') && (
                    <div className="countdown-container">
                      <div className="text-center">
                        <p className="mb-2">Time until interview:</p>
                        <div className="d-flex justify-content-center">
                          {countdownComponents.map(({ label }, index) => (
                            <div key={index} className="px-3 text-center">
                              <p className="countdown-value">{getCountdownValue(interview.interviewDate, label)}</p>
                              <small className="countdown-label">{label}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show outcome badge for past interviews */}
                  {status === 'past' && interview.outcome && (
                    <div className="mt-1 mb-3 text-center">
                      <span className={`badge rounded-pill ${
                        interview.outcome === 'Offer Received' ? 'bg-success' :
                        interview.outcome === 'Rejected' ? 'bg-danger' : 
                        interview.outcome === 'Advanced to Final Round' ? 'bg-info' : 'bg-secondary'
                      } px-3 py-2`} style={{fontSize: '0.9rem'}}>
                        {interview.outcome}
                      </span>
                    </div>
                  )}
                  
                  {/* Interview Description */}
                  {interview.description && (
                    <div className="description-container mb-4">
                      <p className="mb-0">{interview.description}</p>
                    </div>
                  )}
                  
                  {/* Interview Details */}
                  <div className="interview-details mb-4">
                    <h6 className="mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle me-2" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M9.502 10.594a1.482 1.482 0 0 0 0-.471L8.766 8.15a.963.963 0 0 1 .261-.268l.052-.073V6.349a1.405 1.405 0 0 1 1.23-.887l.527-.526a1.403 1.403 0 0 1 1.235.59c.349.194.687.378 1.033.555v.535a1.163 1.163 0 0 1-.231.316l-.527.526a1.403 1.403 0 0 1-.79.175l-.52-.526z"/>
                      </svg>
                      Interview Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Position:</strong> {interview.role || 'Not specified'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>CTC:</strong> {interview.ctc || 'Not specified'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Interview Type:</strong> {interview.interviewType || 'Not specified'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Interview Mode:</strong> {interview.interviewMode || 'Not specified'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Duration:</strong> {interview.duration || 'Not specified'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Location:</strong> {interview.location || 'Not specified'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Interviewer:</strong> {interview.interviewerName || 'To be announced'}
                      </div>
                    </div>
                    
                    {/* Required Skills */}
                    {interview.requiredSkills && interview.requiredSkills.length > 0 && (
                      <div className="mt-3">
                        <h6 className="mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-code-slash me-2" viewBox="0 0 16 16">
                            <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/>
                          </svg>
                          Required Skills
                        </h6>
                        <div className="skill-tags">
                          {interview.requiredSkills.map((skill, index) => (
                            <span key={index} className="badge bg-light text-dark me-2 mb-2">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Preparation Checklist - only for non-past interviews */}
                  {status !== 'past' && (
                    <>
                      <h6 className="checklist-heading">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2-square me-2" viewBox="0 0 16 16">
                          <path d="M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5H3z"/>
                          <path d="M8.354 10.354l7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                        </svg>
                        Preparation Checklist
                      </h6>
                      <div className="preparation-checklist">
                        {Object.entries({
                          'Research Company': 'Research company background',
                          'Prepare Resume': 'Update and print resume',
                          'Practice Common Questions': 'Prepare answers to common questions',
                          'Prepare Questions to Ask': 'Prepare questions to ask the interviewer',
                          'Plan Interview Outfit': 'Prepare professional attire',
                          'Check Technical Setup': 'Check technical setup for virtual interviews'
                        }).map(([key, label]) => (
                          <div className="form-check mb-2" key={key}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`${key}-${interview._id}`}
                              checked={checklist[interview._id]?.[key] || false}
                              onChange={() => handleChecklistItem(interview._id, key)}
                            />
                            <label className="form-check-label" htmlFor={`${key}-${interview._id}`}>
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="action-buttons">
                    {status !== 'past' && (
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => addToCalendar(interview)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-plus" viewBox="0 0 16 16">
                          <path d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"/>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        Add to Calendar
                      </button>
                    )}
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => handleNavigation('/placementmaterial')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-journal-text" viewBox="0 0 16 16">
                        <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z"/>
                      </svg>
                      Preparation Materials
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="scheduled-interview-page">
      {/* Custom navbar without Link components to avoid navigation issues */}
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand me-auto" onClick={() => handleNavigation('/home')} style={{cursor: 'pointer'}}>CareerConnect</span>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Career Connect</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/home')} style={{cursor: 'pointer'}}>Home</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/companylisting')} style={{cursor: 'pointer'}}>Company Listing</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/scheduledInterview')} style={{cursor: 'pointer'}}>Scheduled Interviews</span>
                </li>
                <li className="nav-item">
                  <span 
                    className="nav-link mx-lg-2" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Clicked on Placement Material");
                      
                      // Using direct window location to avoid react-router issues
                      window.location.href = '/placement-material';
                    }} 
                    style={{cursor: 'pointer'}}
                  >
                    Placement Material
                  </span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/interviewexperience')} style={{cursor: 'pointer'}}>Interview Experience</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => handleNavigation('/profile')} style={{cursor: 'pointer'}}>Profile</span>
                </li>
                <li className="nav-item">
                  <span className="nav-link mx-lg-2" onClick={() => {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userId');
                    handleNavigation('/');
                  }} style={{cursor: 'pointer'}}>Logout</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-content">
        <div className="interview-container">
          {/* Page Heading */}
          <div className="page-heading">
            <h1>Your Interview Schedule</h1>
            <p>Track all your upcoming interviews and prepare for success with our interactive tools</p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Group interviews by status */}
              {scheduledInterviews?.length > 0 ? (
                <>
                  {console.log("Rendering interview sections, total interviews:", scheduledInterviews.length)}
                  <div className="debug-info" style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px'}}>
                    <p style={{margin: '0'}}>
                      Total interviews: <strong>{scheduledInterviews.length}</strong><br />
                      Today: <strong>{scheduledInterviews.filter(i => i.status === 'today').length}</strong><br />
                      Upcoming: <strong>{scheduledInterviews.filter(i => i.status === 'upcoming').length}</strong><br />
                      Past: <strong>{scheduledInterviews.filter(i => i.status === 'past').length}</strong>
                    </p>
                  </div>
                  
                  {/* Today's Interviews */}
                  {renderInterviewSection('today', 'Today\'s Interviews')}
                  
                  {/* Upcoming Interviews */}
                  {renderInterviewSection('upcoming', 'Upcoming Interviews')}
                  
                  {/* Past Interviews */}
                  {renderInterviewSection('past', 'Past Interviews')}
                </>
              ) : (
                <div className="empty-state-container">
                  <div className="empty-state">
                    <img src={emptyStateImage} alt="No interviews scheduled" className="img-fluid" />
                    <h3>No Interviews Scheduled Yet</h3>
                    <p>Ready to take the next step in your career? Apply to companies to schedule interviews. Once scheduled, they will appear here for easy tracking and preparation.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleNavigation('/companylisting')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-briefcase me-2" viewBox="0 0 16 16">
                        <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H8v-.5A1.5 1.5 0 0 0 6.5 1z"/>
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/>
                      </svg>
                      Browse Companies
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default ScheduledInterview;