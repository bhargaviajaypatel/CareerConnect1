import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosConfig.js';
import sanitizeHtml from 'sanitize-html';
import Navbar from '../HomeComponents/Navbar.js';
import Footer from "../HomeComponents/Footer.js";
import '../Home-CSS/Application.css';
import '../Home-CSS/interview-experience.css';

// Mock detailed interview experiences for demonstration
const MOCK_DETAILED_EXPERIENCES = [
  {
    _id: "mock1",
    username: 'Vikram Sen',
    companyName: 'Amazon',
    position: 'Security Engineer',
    interviewLevel: 'Easy',
    result: 'Successful',
    experience: `<p>Amazon's interview was challenging but fair. They wanted to see practical coding skills in AWS and problem-solving abilities.</p>

<p>The interview process consisted of 4 rounds:</p>

<p><strong>Round 1: Initial Technical Screening (45 minutes)</strong><br>
- Basic security concepts and AWS security services<br>
- Questions about IAM, security groups, and network ACLs<br>
- Simple coding challenge to identify security vulnerabilities</p>

<p><strong>Round 2: Deep Dive Technical (1 hour)</strong><br>
- Detailed discussion on security design patterns<br>
- Asked to design a secure microservices architecture<br>
- Questions about encryption, key management, and certificate handling<br>
- Specific scenarios involving S3 bucket security and Lambda function permissions</p>

<p><strong>Round 3: System Design (1 hour)</strong><br>
- Asked to design a secure authentication system with MFA<br>
- Discussion about scalability and security trade-offs<br>
- Focus on monitoring and alerting for security incidents<br>
- Error handling and recovery strategies for security breaches</p>

<p><strong>Round 4: Cultural Fit & Leadership Principles (45 minutes)</strong><br>
- Questions aligned with Amazon's leadership principles, especially "Security is Job Zero"<br>
- Scenarios about making security decisions under time constraints<br>
- Asked about my approach to promoting security culture in teams</p>

<p>Tips for others:</p>
<ul>
<li>Know AWS security services in depth</li>
<li>Practice explaining security concepts simply</li>
<li>Be ready with examples of how you've handled security incidents</li>
<li>Understand Amazon's leadership principles before interviewing</li>
</ul>

<p>Overall, it was a positive experience that tested both technical knowledge and practical application of security principles.</p>`
  },
  {
    _id: "mock2",
    username: 'Priya Mehta',
    companyName: 'Google',
    position: 'Software Engineer',
    interviewLevel: 'Difficult',
    result: 'Successful',
    experience: `<p>My Google interview journey was intense but rewarding. The entire process took about 6 weeks from initial contact to offer.</p>

<p><strong>Preparation (3 weeks):</strong><br>
I focused on algorithms, data structures, and system design using:
- LeetCode (100+ medium/hard problems)
- "Cracking the Coding Interview" book
- System Design Primer on GitHub
- Mock interviews with friends at other tech companies</p>

<p><strong>Round 1: Phone Screen (45 minutes)</strong><br>
- Two coding problems on a shared Google Doc
- First problem: String manipulation with dynamic programming
- Second problem: Graph traversal (modified BFS)
- Interviewer was friendly and gave subtle hints when I was stuck</p>

<p><strong>Onsite Interviews (5 rounds in one day):</strong></p>

<p><strong>Round 2: Coding (45 minutes)</strong><br>
- Problem involving tree traversal and optimization
- Had to write clean, efficient code with proper error handling
- Discussed time and space complexity in detail
- Optimized solution from O(n²) to O(n log n)</p>

<p><strong>Round 3: System Design (45 minutes)</strong><br>
- Design a distributed notification system
- Focused on scalability, reliability, and fault tolerance
- Discussed database choices, caching strategies, and load balancing
- Handled edge cases like message delivery guarantees and retry mechanisms</p>

<p><strong>Round 4: Coding + Algorithms (45 minutes)</strong><br>
- Problem involving dynamic programming and optimization
- Started with a brute force approach, then optimized
- Interviewer pushed on edge cases and performance
- Successfully implemented a solution using memoization</p>

<p><strong>Round 5: Behavioral (45 minutes)</strong><br>
- Questions about teamwork, conflict resolution, and leadership
- Discussed past projects and technical challenges
- Asked about how I handle ambiguity and prioritize tasks
- Connected my experiences to Google's culture and values</p>

<p><strong>Round 6: Team Fit (45 minutes)</strong><br>
- Technical discussion related to the specific team
- Deep dive into my background and interests
- Questions about Google technologies I've used
- Discussed potential projects I might work on</p>

<p><strong>Key Learnings:</strong></p>
<ul>
<li>Explaining your thought process is as important as the final solution</li>
<li>Don't be afraid to ask clarifying questions</li>
<li>Practice coding on a whiteboard or Google Doc without IDE assistance</li>
<li>Know your resume thoroughly - be prepared to dive deep on anything you've listed</li>
<li>Stay calm when stuck - interviewers want to see how you handle challenges</li>
</ul>

<p>One week after the onsite, my recruiter called with an offer. The process was well-organized, and while challenging, it gave me a good sense of the work and culture at Google.</p>`
  },
  {
    _id: "mock3",
    username: 'Raj Sharma',
    companyName: 'Microsoft',
    position: 'Frontend Engineer',
    interviewLevel: 'Medium',
    result: 'Successful',
    experience: `<p>I recently interviewed for a Frontend Engineer position at Microsoft, and I want to share my experience to help others prepare.</p>

<p><strong>Application Process:</strong><br>
I applied through Microsoft's careers website and heard back from a recruiter within 2 weeks. The entire process took about 5 weeks from application to offer.</p>

<p><strong>Round 1: Technical Screen (60 minutes)</strong><br>
- Started with a brief introduction
- Coding problem: Implement a debounce function from scratch
- Follow-up: Modify the implementation to support both immediate and delayed execution
- Questions about React lifecycle methods and state management
- Discussion about CSS layout techniques (Flexbox vs Grid)</p>

<p><strong>Round 2: Virtual Onsite (4 hours spread across a day)</strong></p>

<p><strong>Interview 1: Frontend Coding (60 minutes)</strong><br>
- Build a simple component that displays a list of items with filtering
- Implementation needed to handle edge cases like empty states and errors
- Focus on accessibility and semantic HTML
- Performance optimization questions
- Had to explain why I made certain architectural decisions</p>

<p><strong>Interview 2: JavaScript Fundamentals (60 minutes)</strong><br>
- Deep dive into closures, prototypes, and the event loop
- Implement a simple promise polyfill
- Questions about browser rendering pipeline
- Discussion about memory management in JavaScript
- Code review exercise where I had to identify and fix issues</p>

<p><strong>Interview 3: System Design (60 minutes)</strong><br>
- Design a real-time collaborative editor (similar to Google Docs)
- Focus on frontend architecture, state management, and data synchronization
- Discussion about handling conflicts and network latency
- Consideration for different devices and responsive design
- Questions about scalability and performance optimization</p>

<p><strong>Interview 4: Behavioral and Team Fit (60 minutes)</strong><br>
- Questions aligned with Microsoft's growth mindset culture
- Asked about handling feedback and learning from failures
- Discussion about working in diverse teams and resolving conflicts
- Questions about my approach to mentoring and knowledge sharing
- Scenarios about balancing quality vs. speed</p>

<p><strong>Key Observations:</strong></p>
<ul>
<li>Microsoft emphasized practical skills over algorithmic puzzles</li>
<li>Strong focus on fundamentals rather than framework-specific knowledge</li>
<li>Interviewers were genuinely interested in how I approached problems</li>
<li>Questions assessed both depth of technical knowledge and breadth of experience</li>
<li>Cultural fit was as important as technical ability</li>
</ul>

<p><strong>Preparation Tips:</strong></p>
<ul>
<li>Review JavaScript fundamentals thoroughly (closures, this, prototypes)</li>
<li>Practice building components from scratch without relying on libraries</li>
<li>Understand React's performance optimization techniques</li>
<li>Be ready to explain architectural decisions and trade-offs</li>
<li>Familiarize yourself with Microsoft's culture and values</li>
</ul>

<p>I received an offer a week after the final round. Overall, it was a fair and comprehensive process that tested both technical skills and problem-solving approach.</p>`
  }
];

function InterviewExperience() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  // Stats calculation
  const getInterviewStats = () => {
    if (!interviews.length) return { total: 0, easy: 0, medium: 0, hard: 0, success: 0 };
    
    return {
      total: interviews.length,
      easy: interviews.filter(i => i.interviewLevel?.toLowerCase() === 'easy').length,
      medium: interviews.filter(i => i.interviewLevel?.toLowerCase() === 'medium').length,
      hard: interviews.filter(i => i.interviewLevel?.toLowerCase() === 'hard' || i.interviewLevel?.toLowerCase() === 'difficult').length,
      success: interviews.filter(i => i.result === 'Successful').length,
    };
  };
  
  // Handle navigation functions
  const handleNavigation = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Navigating to:", path);
    try {
    navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to direct href in case of router issues
      window.location.href = path;
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      
      try {
        // First try to get data from the API
        console.log("Attempting to fetch interview experiences from API...");
      const response = await axios.get('/auth/fetchinterviewexperience');
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          console.log(`Found ${response.data.data.length} interviews from API`);
      setInterviews(response.data.data);
        } else {
          // If API returns empty data, use mock data
          console.log("API returned empty data, using mock interview experiences");
          console.log(`Loading ${MOCK_DETAILED_EXPERIENCES.length} mock interviews`);
          setInterviews(MOCK_DETAILED_EXPERIENCES);
        }
      } catch (error) {
        // If API call fails, use mock data
        console.error('Error fetching from API, using mock data:', error);
        console.log(`Loading ${MOCK_DETAILED_EXPERIENCES.length} mock interviews`);
        setInterviews(MOCK_DETAILED_EXPERIENCES);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetch process:', error);
      setLoading(false);
    }
  };

  // Authentication check
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated || !userEmail) {
      navigate("/login");
      return;
    }
    
    fetchInterviews();
  }, [navigate]);

  const sanitizeContent = (content) => {
    return sanitizeHtml(content, {
      allowedTags: ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      allowedAttributes: {
        'a': ['href', 'target'],
        '*': ['style', 'class']
      },
    });
  };
  
  // Filter interviews based on search term and filters
  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = 
      (interview.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.username?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = 
      filterDifficulty === 'all' || 
      interview.interviewLevel?.toLowerCase() === filterDifficulty;
    
    const matchesResult = 
      filterResult === 'all' || 
      interview.result === filterResult;
    
    return matchesSearch && matchesDifficulty && matchesResult;
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('all');
    setFilterResult('all');
  };
  
  const stats = getInterviewStats();
  
  // Get difficulty badge class
  const getDifficultyClass = (level) => {
    if (!level) return '';
    
    level = level.toLowerCase();
    if (level === 'easy') return 'easy';
    if (level === 'hard' || level === 'difficult') return 'hard';
    return '';
  };
  
  // Get result badge class
  const getResultClass = (result) => {
    if (!result) return '';
    
    result = result.toLowerCase();
    if (result === 'successful') return 'successful';
    if (result === 'rejected') return 'rejected';
    if (result === 'waiting') return 'waiting';
    return '';
  };

  // Handle interview item click to show modal
  const handleInterviewClick = (interview) => {
    setSelectedInterview(interview);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Navbar />

      {/* Interview Experience Page */}
      <div className="interview-experience-page">
        <div className="container-fluid px-4 py-3">
          <div className="row">
            {/* Left Sidebar - Interview Stats */}
            <div className="col-lg-3 col-md-4">
              <div className="left-sidebar">
                {/* Page Title */}
                <div className="sidebar-header mb-4">
                  <h2>Interview<br />Experiences</h2>
                  <p className="subtitle">Prepare yourself for interviews and learn from others' experiences</p>
                </div>
                
          {/* Stats Cards */}
                <div className="stats-card successful-card">
                  <div className="stats-number">{stats.success}</div>
                  <div className="stats-label">Successful</div>
              </div>
                
                <div className="stats-card medium-card">
                  <div className="stats-number">{stats.medium}</div>
                  <div className="stats-label">Medium Difficulty</div>
            </div>
            
                <div className="stats-card hard-card">
                  <div className="stats-number">{stats.hard}</div>
                  <div className="stats-label">Hard Difficulty</div>
            </div>
            
                {/* Add Experience Button */}
                <button 
                  onClick={(e) => handleNavigation('/addexperience', e)} 
                  className="share-experience-btn mt-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle me-2" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Share Your Experience
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="col-lg-9 col-md-8">
              <div className="main-content">
                {/* Filters Section */}
                <div className="filters-section mb-4">
                  {/* Difficulty Filter */}
                  <div className="filter-group me-3">
                    <label className="form-label mb-1">Difficulty Level:</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select"
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                      >
                        <option value="all">All Levels</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard/Difficult</option>
                      </select>
            </div>
          </div>
          
                  {/* Result Filter */}
                  <div className="filter-group me-3">
                    <label className="form-label mb-1">Interview Result:</label>
                    <div className="select-wrapper">
              <select 
                        className="form-select"
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
              >
                <option value="all">All Results</option>
                <option value="Successful">Successful</option>
                <option value="Rejected">Rejected</option>
                <option value="Waiting">Waiting</option>
              </select>
                    </div>
            </div>
            
                  {/* Reset Button */}
                  <button onClick={resetFilters} className="reset-filters-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                </svg>
                    Reset Filters
              </button>
          </div>
          
                {/* Interview Experiences List */}
          {loading ? (
            <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="loading-text">Loading interview experiences...</p>
                    </div>
                ) : (
                  <>
                    {filteredInterviews.length > 0 ? (
                      <div className="interview-list">
                        {filteredInterviews.map((interview) => (
                          <div 
                            key={interview._id} 
                            className="interview-item" 
                            onClick={() => handleInterviewClick(interview)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="company-details">
                              <h3 className="company-name">{interview.companyName}</h3>
                              <div className="position">{interview.position}</div>
                              
                              <div className="badges-container">
                                <span className={`badge ${getDifficultyClass(interview.interviewLevel)}`}>
                        {interview.interviewLevel}
                      </span>
                                <span className={`badge ${getResultClass(interview.result)}`}>
                        {interview.result}
                      </span>
                    </div>
                  </div>
                            
                            <div className="experience-content">
                              <div 
                    dangerouslySetInnerHTML={{ 
                                  __html: sanitizeContent(interview.experience).length > 200
                                    ? sanitizeContent(interview.experience).substring(0, 200) + '...' 
                        : sanitizeContent(interview.experience) 
                    }} 
                  />
                    </div>
                            
                            <div className="interview-meta">
                              <div className="author">
                                <span className="author-initial">{interview.username?.slice(0, 1).toUpperCase()}</span>
                                <span>{interview.username}</span>
                    </div>
                              <div className="date">Invalid Date</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                            <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                            <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                          </svg>
              </div>
                        <h3 className="empty-state-title">No Interview Experiences Found</h3>
              <p className="empty-state-message">
                          No interviews match your current filter criteria. Try adjusting your filters or be the first to share an interview experience!
              </p>
                        <button onClick={(e) => handleNavigation('/addexperience', e)} className="empty-state-action">
                Share Your Experience
              </button>
            </div>
          )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Interview Experience Modal */}
      {showModal && selectedInterview && (
        <div className="custom-modal">
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="custom-modal-container">
            <div className="custom-modal-content">
              <div className="custom-modal-header">
                <h5 className="custom-modal-title fw-bold">
                  {selectedInterview.companyName} - {selectedInterview.position}
                </h5>
                <button type="button" className="custom-modal-close" onClick={handleCloseModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="custom-modal-body">
                <div className="interview-modal-content">
                  <div className="mb-3">
                    <div className="d-flex gap-2 mb-3">
                      <span className={`badge ${getDifficultyClass(selectedInterview.interviewLevel)}`}>
                        {selectedInterview.interviewLevel}
                      </span>
                      <span className={`badge ${getResultClass(selectedInterview.result)}`}>
                        {selectedInterview.result}
                      </span>
                    </div>
                    
                    <div className="interview-full-content mb-4">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeContent(selectedInterview.experience) }} />
                    </div>
                    
                    <div className="interview-author mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="author-initial me-2">
                          {selectedInterview.username?.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{selectedInterview.username}</span>
                      </div>
                      <small className="text-muted">Invalid Date</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="custom-modal-footer">
                <button type="button" className="btn-close-modal" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
}

export default InterviewExperience;
