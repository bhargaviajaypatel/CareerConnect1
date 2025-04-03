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
  }, [navigate]);

  // Modified to use direct mock data with all possible interview scenarios
  const fetchScheduledInterviews = useCallback(() => {
    console.log("Fetching scheduled interviews...");
    setLoading(true);
    
    // Create mock data for UI display
    const today = new Date();
    
    // Get user role from localStorage to identify special users
    const userRole = localStorage.getItem('userRole');
    const isSpecialUser = userRole === 'admin' || userRole === 'recruiter';
    console.log("User role:", userRole, "Is special user:", isSpecialUser);
    
    // Create mock interview data with various scenarios
    let mockInterviews = [
      {
        _id: 'mock-interview-1',
        companyName: 'Google',
        role: 'Senior Frontend Developer',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0, 0),
        interviewType: 'Technical',
        interviewMode: 'Virtual',
        interviewerName: 'John Smith',
        location: 'Google Meet',
        duration: '1 hour',
        description: 'This technical interview will focus on React, JavaScript and frontend architecture.'
      },
      {
        _id: 'mock-interview-2',
        companyName: 'Microsoft',
        role: 'Full Stack Developer',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30, 0),
        interviewType: 'HR Round',
        interviewMode: 'In-person',
        interviewerName: 'Sarah Johnson',
        location: 'Microsoft Campus, Building 43',
        duration: '45 minutes',
        description: 'Initial HR screening to discuss your experience and career goals.'
      },
      {
        _id: 'mock-interview-3',
        companyName: 'Amazon',
        role: 'Software Engineer',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 15, 0, 0),
        interviewType: 'System Design',
        interviewMode: 'Virtual',
        interviewerName: 'Michael Brown',
        location: 'Amazon Chime',
        duration: '2 hours',
        description: 'You will be asked to design a scalable system and discuss your approach.'
      },
      {
        _id: 'mock-interview-4',
        companyName: 'Apple',
        role: 'UI/UX Designer',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 11, 0, 0),
        interviewType: 'Portfolio Review',
        interviewMode: 'In-person',
        interviewerName: 'Emily Davis',
        location: 'Apple Park, Cupertino',
        duration: '1.5 hours',
        description: 'Please bring your portfolio and be prepared to discuss your design process.'
      },
      {
        _id: 'mock-interview-5',
        companyName: 'Meta',
        role: 'Data Scientist',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 13, 0, 0),
        interviewType: 'Technical Assessment',
        interviewMode: 'Virtual',
        interviewerName: 'Robert Wilson',
        location: 'Zoom Meeting',
        duration: '1 hour',
        description: 'Technical interview focusing on statistics, machine learning algorithms and SQL.'
      },
      {
        _id: 'mock-interview-6',
        companyName: 'Netflix',
        role: 'Backend Developer',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0, 0),
        interviewType: 'Coding Challenge',
        interviewMode: 'Virtual',
        interviewerName: 'Jennifer Lee',
        location: 'HackerRank Live',
        duration: '1.5 hours',
        description: 'Live coding session focusing on data structures, algorithms and problem-solving.'
      },
      {
        _id: 'mock-interview-7',
        companyName: 'Spotify',
        role: 'Mobile Developer',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 9, 0, 0),
        interviewType: 'Final Round',
        interviewMode: 'Virtual',
        interviewerName: 'David Chen',
        location: 'Microsoft Teams',
        duration: '2 hours',
        description: 'Panel interview with the engineering team to discuss your experience and technical skills.'
      },
      {
        _id: 'mock-interview-8',
        companyName: 'Adobe',
        role: 'Product Manager',
        interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 0, 0),
        interviewType: 'Case Study',
        interviewMode: 'In-person',
        interviewerName: 'Michelle Park',
        location: 'Adobe HQ, San Jose',
        duration: '1 hour',
        description: 'You will be given a product case to analyze and present your recommendations.'
      }
    ];
    
    // Add more interviews for special users
    if (isSpecialUser || true) { // Force true for demo purposes
      // Add more today's interviews
      const additionalTodayInterviews = [
        {
          _id: 'mock-interview-today-1',
          companyName: 'IBM',
          role: 'Cloud Architect',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 45, 0),
          interviewType: 'Technical Assessment',
          interviewMode: 'Virtual',
          interviewerName: 'Richard Thompson',
          location: 'IBM WebEx',
          duration: '1.5 hours',
          description: 'Deep dive into cloud architecture patterns, AWS/Azure experience, and system design principles.'
        },
        {
          _id: 'mock-interview-today-2',
          companyName: 'Salesforce',
          role: 'Solution Architect',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 15, 0),
          interviewType: 'Case Study',
          interviewMode: 'Virtual',
          interviewerName: 'Amanda Rogers',
          location: 'Salesforce Meeting',
          duration: '1 hour',
          description: 'You will be presented with a customer scenario and asked to design a Salesforce solution.'
        },
        {
          _id: 'mock-interview-today-3',
          companyName: 'Oracle',
          role: 'Database Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0),
          interviewType: 'Technical',
          interviewMode: 'Virtual',
          interviewerName: 'Brian Miller',
          location: 'Oracle Zoom',
          duration: '1 hour',
          description: 'Discussion of database optimization, query performance, and distributed systems.'
        },
        {
          _id: 'mock-interview-today-4',
          companyName: 'Intel',
          role: 'Hardware Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30, 0),
          interviewType: 'Technical',
          interviewMode: 'In-person',
          interviewerName: 'Karen Rodriguez',
          location: 'Intel HQ, Santa Clara',
          duration: '2 hours',
          description: 'This interview will focus on digital circuit design, FPGA programming, and hardware verification techniques.'
        }
      ];
      
      // Add more upcoming interviews
      const additionalUpcomingInterviews = [
        {
          _id: 'mock-interview-upcoming-1',
          companyName: 'Twitter',
          role: 'DevOps Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 13, 0, 0),
          interviewType: 'Technical',
          interviewMode: 'Virtual',
          interviewerName: 'Christine Walker',
          location: 'Twitter Meet',
          duration: '2 hours',
          description: 'Focus on CI/CD pipelines, Docker, Kubernetes, and infrastructure as code.'
        },
        {
          _id: 'mock-interview-upcoming-2',
          companyName: 'LinkedIn',
          role: 'Senior Data Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 11, 30, 0),
          interviewType: 'System Design & Coding',
          interviewMode: 'Virtual',
          interviewerName: 'Jason Patel',
          location: 'LinkedIn Teams',
          duration: '3 hours',
          description: 'Multiple rounds: 1) System design for data pipelines 2) SQL and Python coding 3) Behavioral'
        },
        {
          _id: 'mock-interview-upcoming-3',
          companyName: 'Airbnb',
          role: 'Frontend Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 14, 0, 0),
          interviewType: 'Technical & Culture',
          interviewMode: 'In-person',
          interviewerName: 'Sophie Greene',
          location: 'Airbnb HQ, San Francisco',
          duration: '4 hours',
          description: 'Full-day interview process with multiple team members, focusing on React, state management, and frontend architecture.'
        },
        {
          _id: 'mock-interview-upcoming-4',
          companyName: 'Uber',
          role: 'Machine Learning Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 10, 0, 0),
          interviewType: 'ML Case Study',
          interviewMode: 'Virtual',
          interviewerName: 'Dr. Alan Chen',
          location: 'Uber Zoom',
          duration: '2 hours',
          description: 'Bring your expertise in machine learning algorithms and prepare to discuss a case study on real-time prediction systems.'
        },
        {
          _id: 'mock-interview-upcoming-5',
          companyName: 'Samsung',
          role: 'Mobile App Developer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0, 0),
          interviewType: 'Technical & Portfolio',
          interviewMode: 'Virtual',
          interviewerName: 'Jae-Sung Kim',
          location: 'Samsung Teams',
          duration: '2 hours',
          description: 'Interview focusing on Android development expertise, UI/UX principles, and portfolio review of your mobile applications.'
        },
        {
          _id: 'mock-interview-upcoming-6',
          companyName: 'Tesla',
          role: 'Autonomous Vehicle Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 14, 0, 0),
          interviewType: 'Technical Assessment',
          interviewMode: 'In-person',
          interviewerName: 'Dr. Laura Martinez',
          location: 'Tesla Headquarters, Palo Alto',
          duration: '3 hours',
          description: 'Extended technical interview focusing on computer vision, sensor fusion, and machine learning for autonomous systems.'
        }
      ];

      // Add past interviews with diverse outcomes
      const additionalPastInterviews = [
        {
          _id: 'mock-interview-past-1',
          companyName: 'Cisco',
          role: 'Network Engineer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 13, 0, 0),
          interviewType: 'Technical Panel',
          interviewMode: 'Virtual',
          interviewerName: 'Robert Johnson & Team',
          location: 'Cisco WebEx',
          duration: '2 hours',
          description: 'Panel interview focusing on network engineering principles, router configuration, and security protocols.',
          feedback: 'Passed - Feedback indicated strong technical knowledge and problem-solving skills.',
          outcome: 'Offer Received'
        },
        {
          _id: 'mock-interview-past-2',
          companyName: 'Shopify',
          role: 'Backend Ruby Developer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14, 10, 0, 0),
          interviewType: 'Pair Programming',
          interviewMode: 'Virtual',
          interviewerName: 'Emma Thompson',
          location: 'Shopify Zoom',
          duration: '1.5 hours',
          description: 'Pair programming session focusing on Ruby on Rails, API design, and database optimization.',
          feedback: 'Did not meet all technical requirements for the role.',
          outcome: 'Rejected'
        },
        {
          _id: 'mock-interview-past-3',
          companyName: 'Nvidia',
          role: 'CUDA Developer',
          interviewDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 15, 30, 0),
          interviewType: 'Technical Assessment',
          interviewMode: 'Virtual',
          interviewerName: 'Dr. Michael Chen',
          location: 'Nvidia Teams',
          duration: '2 hours',
          description: 'Technical interview focusing on GPU programming, parallel computing, and CUDA optimization techniques.',
          feedback: 'Strong technical skills demonstrated, invited for next round.',
          outcome: 'Advanced to Final Round'
        }
      ];
      
      // Add the additional interviews to the mock data
      mockInterviews = [...mockInterviews, ...additionalTodayInterviews, ...additionalUpcomingInterviews, ...additionalPastInterviews];
    }
    
    console.log("Raw mock interviews:", mockInterviews);
    
    // Initialize checklist for all interviews at once
    const newChecklist = {};
    mockInterviews.forEach(interview => {
      newChecklist[interview._id] = {
        'resume': false,
        'research': false,
        'questions': false,
        'attire': false,
        'documents': false,
        'practice': false, 
        'portfolio': false
      };
    });
    setChecklist(prev => ({...prev, ...newChecklist}));
    
    const processedMockInterviews = mockInterviews.map(interview => {
      const interviewDate = new Date(interview.interviewDate);
      
      // Create formatted date string
      const formattedDate = interviewDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create formatted time string
      const formattedTime = interviewDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Determine status
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const interviewDay = new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate());
      
      console.log("Interview Date Check:", {
        interview: interview.companyName,
        interviewDate: interviewDate.toString(),
        interviewDay: interviewDay.toString(),
        today: today.toString(),
        isToday: interviewDay.getTime() === today.getTime(),
        isPast: interviewDate < now
      });
      
      let status = 'upcoming';
      if (interviewDate < now) {
        status = 'past';
      } else if (interviewDay.getTime() === today.getTime()) {
        status = 'today';
      }
      
      console.log(`${interview.companyName} status: ${status}`);
      
      return {
        ...interview,
        formattedDate,
        formattedTime,
        status,
        interviewDate,
        interviewDateTime: interviewDate
      };
    });
    
    // Sort mock interviews
    processedMockInterviews.sort((a, b) => {
      if (a.status === 'past' && b.status !== 'past') return 1;
      if (a.status !== 'past' && b.status === 'past') return -1;
      return a.interviewDateTime - b.interviewDateTime;
    });
    
    console.log("Generated mock interviews:", processedMockInterviews);
    
    // Set state and end loading
    setScheduledInterviews(processedMockInterviews);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchScheduledInterviews();
      
      // Additional debugging code to check if interviews are loaded
      const debugTimeout = setTimeout(() => {
        console.log("Checking scheduled interviews after 2 seconds:", scheduledInterviews);
      }, 2000);
      
      // Clean up timeout to prevent memory leaks
      return () => clearTimeout(debugTimeout);
    }
  }, [currentUser, fetchScheduledInterviews, scheduledInterviews]);

  useEffect(() => {
    // Update countdown timers every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      
      let newCountdown = {};
      scheduledInterviews.forEach(interview => {
        if (interview.status === 'past') {
          newCountdown[interview._id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
          return;
        }
        
        const interviewTime = new Date(interview.interviewDate).getTime();
        const timeLeft = interviewTime - now;
        
        if (timeLeft <= 0) {
          newCountdown[interview._id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        } else {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          
          newCountdown[interview._id] = { days, hours, minutes, seconds };
        }
      });
      
      setCountdown(newCountdown);
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
    
    // Always render the section, even if empty for debugging
    return (
      <div key={status} className="interview-section">
        <div className={`status-heading ${status}`}>
          {status === 'today' && (
            <span className="badge bg-warning me-2">Today</span>
          )}
          {title} <span className="ms-2 small">({filteredInterviews.length})</span>
        </div>
        
        {filteredInterviews.length > 0 ? (
          filteredInterviews.map(interview => (
            <div key={interview._id} className={`interview-card ${status}`}>
              {/* Status Badge */}
              <span className={`badge status-badge ${status}-badge`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              
              <div className="card-content">
                <div className="d-flex align-items-center">
                  <div className={`company-initials ${status} me-3`}>
                    {getCompanyInitials(interview.companyName)}
                  </div>
                  <div className="interview-info">
                    <h5>{interview.companyName}</h5>
                    <div className="text-muted small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar me-1" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                      </svg>
                      {interview.formattedDate} at {interview.formattedTime}
                    </div>
                    {interview.role && (
                      <div className="mt-1 d-flex align-items-center flex-wrap">
                        <span className="badge rounded-pill bg-light text-dark me-2 mb-1">
                          {interview.role}
                        </span>
                        {interview.interviewType && (
                          <span className="badge rounded-pill bg-light text-dark me-2 mb-1">
                            {interview.interviewType}
                          </span>
                        )}
                        {interview.interviewMode && (
                          <span className="badge rounded-pill bg-light text-dark mb-1">
                            {interview.interviewMode}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Show outcome badge for past interviews */}
                    {status === 'past' && interview.outcome && (
                      <div className="mt-1">
                        <span className={`badge rounded-pill ${
                          interview.outcome === 'Offer Received' ? 'bg-success' :
                          interview.outcome === 'Rejected' ? 'bg-danger' : 
                          interview.outcome === 'Advanced to Final Round' ? 'bg-info' : 'bg-secondary'
                        } me-2`}>
                          {interview.outcome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* View/Hide Details Button */}
                <div className="text-center mt-3">
                  <button 
                    className="btn btn-link text-decoration-none"
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
                      <div className="mt-1">
                        <span className={`badge rounded-pill ${
                          interview.outcome === 'Offer Received' ? 'bg-success' :
                          interview.outcome === 'Rejected' ? 'bg-danger' : 
                          interview.outcome === 'Advanced to Final Round' ? 'bg-info' : 'bg-secondary'
                        } me-2`}>
                          {interview.outcome}
                        </span>
                      </div>
                    )}
                    
                    {/* Feedback for past interviews - CORRECT PLACEMENT */}
                    {status === 'past' && interview.feedback && (
                      <div className="feedback-container mb-4 p-3 bg-light rounded">
                        <h6 className="mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-quote me-2" viewBox="0 0 16 16">
                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                            <path d="M7.066 6.76A1.665 1.665 0 0 0 4 7.668a1.667 1.667 0 0 0 2.561 1.406c-.131.389-.375.804-.777 1.22a.417.417 0 0 0 .6.58c1.486-1.54 1.293-3.214.682-4.112zm4 0A1.665 1.665 0 0 0 8 7.668a1.667 1.667 0 0 0 2.561 1.406c-.131.389-.375.804-.777 1.22a.417.417 0 0 0 .6.58c1.486-1.54 1.293-3.214.682-4.112z"/>
                          </svg>
                          Feedback
                        </h6>
                        <p className="mb-0">{interview.feedback}</p>
                      </div>
                    )}
                    
                    {/* Interview Description */}
                    {interview.description && (
                      <div className="description-container mb-4">
                        <p className="mb-0 fst-italic">{interview.description}</p>
                      </div>
                    )}
                    
                    {/* Interview Details */}
                    <div className="interview-details mb-4">
                      <h6 className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle me-2" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        Interview Details
                      </h6>
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <strong>Position:</strong> {interview.role || 'Not specified'}
                        </div>
                        <div className="col-md-6 mb-2">
                          <strong>Interview Type:</strong> {interview.interviewType || 'Not specified'}
                        </div>
                        <div className="col-md-6 mb-2">
                          <strong>Mode:</strong> {interview.interviewMode || 'Not specified'}
                        </div>
                        <div className="col-md-6 mb-2">
                          <strong>Interviewer:</strong> {interview.interviewerName || 'Not specified'}
                        </div>
                        {interview.location && (
                          <div className="col-md-6 mb-2">
                            <strong>Location:</strong> {interview.location}
                          </div>
                        )}
                        {interview.duration && (
                          <div className="col-md-6 mb-2">
                            <strong>Duration:</strong> {interview.duration}
                          </div>
                        )}
                        {status === 'past' && interview.outcome && (
                          <div className="col-md-6 mb-2">
                            <strong>Outcome:</strong> {interview.outcome}
                          </div>
                        )}
                      </div>
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
                            'resume': 'Update and print resume',
                            'research': 'Research company background',
                            'questions': 'Prepare answers to common questions',
                            'attire': 'Prepare professional attire',
                            'documents': 'Gather required documents',
                            'practice': 'Practice coding problems',
                            'portfolio': 'Update portfolio with recent projects'
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
                      {/* Only show Add to Calendar for upcoming and today interviews */}
                      {(status === 'upcoming' || status === 'today') && (
                        <button 
                          className="btn btn-outline-primary d-flex align-items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCalendar(interview);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-plus me-2" viewBox="0 0 16 16">
                            <path d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          Add to Calendar
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-info d-flex align-items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation('/interviewexperience');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-journal-text me-2" viewBox="0 0 16 16">
                          <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3z"/>
                        </svg>
                        View Experiences
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="alert alert-info">No {status} interviews found.</div>
        )}
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
            <>
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
                        <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/>
                      </svg>
                      Browse Companies
                    </button>
                  </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default ScheduledInterview;