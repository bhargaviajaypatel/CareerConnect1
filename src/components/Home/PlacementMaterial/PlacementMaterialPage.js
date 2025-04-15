import { useState, useEffect, useCallback, useRef } from "react";
import axios from "../../../api/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import Navbar from "../HomeComponents/Navbar.js";
import Footer from "../HomeComponents/Footer.js";
import "../Home-CSS/Faq.css";
import "./PlacementMaterial.css";

// Utility function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

function PlacementMaterialPage() {
  const [companies, setCompanies] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('roadmaps');
  const [searchQuery, setSearchQuery] = useState('');
  // Custom roadmap generator state variables
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customJobProfile, setCustomJobProfile] = useState('');
  const [customRoles, setCustomRoles] = useState('');
  const [customRoadmap, setCustomRoadmap] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  // Add state for saved roadmaps
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  

  
  const navigate = useNavigate();

  // Add this reference to track mounting/unmounting
  const companiesGridRef = useRef(null);
  
  // Modified fetchCompanies to not use sample data fallback
  const fetchCompanies = useCallback(async () => {
    try {
      console.log("Making request to get companies...");
      const response = await axios.get("/auth/getCompanies");
      console.log("Full API response:", response);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log("API returned companies:", response.data.data);
        console.log("First company sample:", response.data.data[0]);
        setCompanies(response.data.data);
      } else {
        console.log("API returned no companies, response data:", response.data);
        setError("No companies available. Please check back later.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching companies:", err);
      console.error("Error details:", err.response || err.message || err);
      setError("Failed to load companies. Please try again later.");
      setLoading(false);
    }
  }, []); // Removed loadSampleCompanies dependency

  // Define fetchRoadmaps using useCallback
  const fetchRoadmaps = useCallback(async () => {
    try {
      const response = await axios.get("/roadmap/all");
      if (response.data && response.data.roadmaps) {
        setRoadmaps(response.data.roadmaps);
      }
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
      // Don't set error since this is not critical functionality
    }
  }, []);

  // Define fetchSavedRoadmaps using useCallback
  const fetchSavedRoadmaps = useCallback(async () => {
    try {
      const response = await axios.get("/roadmap/saved");
      if (response.data && response.data.savedRoadmaps) {
        setSavedRoadmaps(response.data.savedRoadmaps.map(roadmap => roadmap._id));
      }
    } catch (err) {
      console.error("Error fetching saved roadmaps:", err);
      // Don't set error since this is not critical functionality
    }
  }, []);

  // Modify the verifyAndFetchData function to be more resilient
  const verifyAndFetchData = useCallback(async () => {
    try {
      // Get the email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated || !userEmail) {
        console.log("Not authenticated, redirecting to login");
        navigate("/login");
        return;
      }
      
      try {
        const verifyRes = await axios.get("/auth/verify", {
          params: { email: userEmail }
        });
        
        console.log("Verify response:", verifyRes.data);
        
        if (verifyRes.data === "Invalid") {
          console.log("Authentication failed, redirecting to login");
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          navigate("/login");
          return;
        }
        
        if (verifyRes.data === "Admin") {
          console.log("User is admin, redirecting to admin page");
          navigate("/admin");
          return;
        }
      } catch (authErr) {
        console.error("Authentication check failed:", authErr);
        // Continue with local data if auth check fails
      }
      
      // Fetch data only if it hasn't been loaded already
      if (loading) {
        try {
          await fetchCompanies();
        } catch (fetchError) {
          console.error("Failed to fetch companies:", fetchError);
          // Fallback to sample data
          fetchCompanies();
        }
        
        try {
          await fetchRoadmaps();
        } catch (roadmapsError) {
          console.error("Failed to fetch roadmaps:", roadmapsError);
          // Non-critical, continue
        }
        
        try {
          await fetchSavedRoadmaps();
        } catch (savedError) {
          console.error("Failed to fetch saved roadmaps:", savedError);
          // Non-critical, continue
        }
      }
      
      // Ensure loading is set to false no matter what
      setLoading(false);
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred. Using local data.");
      fetchCompanies();
      setLoading(false);
    }
  }, [navigate, fetchCompanies, fetchRoadmaps, fetchSavedRoadmaps]); // Removed companies from dependency array

  // Replace the existing useEffect with our new implementation
  useEffect(() => {
    verifyAndFetchData();
  }, [verifyAndFetchData]);

  // Add function to toggle save roadmap
  const toggleSaveRoadmap = async (roadmapId) => {
    try {
      // Display loading state
      setError("Processing roadmap...");
      
      // Find the roadmap details to save to profile
      let roadmapToSave = roadmaps.find(r => r._id === roadmapId);
      
      // If roadmap not found in the roadmaps array, create a temporary one based on the selected company
      if (!roadmapToSave && selectedCompany) {
        console.log("Creating temporary roadmap based on selected company:", selectedCompany);
        const company = companies.find(c => c._id === selectedCompany);
        if (company) {
          roadmapToSave = {
            _id: roadmapId,
            title: `${company.companyname || company.name} Career Path`,
            description: `A comprehensive learning roadmap for ${company.jobprofile || 'professional'} roles at ${company.companyname || company.name}.`,
            companyId: company._id,
            skills: [
              { name: "Technical Skills", description: "Core technical competencies required for this role" },
              { name: "Soft Skills", description: "Important non-technical skills for career growth" },
              { name: `${company.companyname || company.name} Specific Knowledge`, description: `Learn about ${company.companyname || company.name}'s products, culture, and interview process` }
            ]
          };
        }
      }
      
      if (!roadmapToSave) {
        setError("Roadmap not found.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userId && !userEmail) {
        setError("Please login to save roadmaps");
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Check if already saved
      const isSaved = savedRoadmaps.includes(roadmapId);
      console.log(`Roadmap ${roadmapId} is ${isSaved ? 'already saved' : 'not saved yet'}`);
      
      // Prepare roadmap data for saving
      const roadmapData = {
        roadmapId,
        userId: userId,
        userEmail: userEmail,
        title: roadmapToSave.title || 'Career Preparation Path',
        description: roadmapToSave.description || 'Follow this structured learning path to prepare for your interviews.',
        company: roadmapToSave.companyId ? 
          (typeof roadmapToSave.companyId === 'object' ? 
            roadmapToSave.companyId.companyname || roadmapToSave.companyId.name : 
            companies.find(c => c._id === roadmapToSave.companyId)?.companyname || 'Unknown Company') : 
          'Custom Roadmap',
        savedAt: new Date().toISOString(),
        skills: roadmapToSave.skills || []
      };
      
      // First update local state and localStorage before attempting API call
      // This ensures a responsive UI even if the API is slow or fails
      if (!isSaved) {
        // Add to saved roadmaps in state
        setSavedRoadmaps(prev => [...prev, roadmapId]);
        
        // Save to localStorage
        const savedRoadmapsInStorage = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
        savedRoadmapsInStorage.push(roadmapData);
        localStorage.setItem('savedRoadmaps', JSON.stringify(savedRoadmapsInStorage));
        
        setError("Roadmap saved to your profile!");
      } else {
        // Remove from saved roadmaps in state
        setSavedRoadmaps(prev => prev.filter(id => id !== roadmapId));
        
        // Remove from localStorage
        const savedRoadmapsInStorage = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
        const updatedRoadmaps = savedRoadmapsInStorage.filter(r => r.roadmapId !== roadmapId);
        localStorage.setItem('savedRoadmaps', JSON.stringify(updatedRoadmaps));
        
        setError("Roadmap removed from saved list");
      }
      
      // Now attempt the API call
      try {
        // Make API call to save or remove roadmap
        const endpoint = isSaved ? `/roadmap/unsave/${roadmapId}` : `/roadmap/save`;
        console.log(`Attempting API call to ${endpoint}`, roadmapData);
        
        const response = await axios.post(endpoint, roadmapData);
        
        console.log(`API response from ${endpoint}:`, response.data);
        
        // API call succeeded, no need to do anything else as we've already updated the UI
        // Just update the message to confirm it was saved to the server
        if (!isSaved) {
          setError("Roadmap saved to your profile and synced with server!");
        } else {
          setError("Roadmap removed from your profile and synced with server!");
        }
        
      } catch (apiError) {
        console.error(`API error when calling ${isSaved ? 'unsave' : 'save'} endpoint:`, apiError);
        
        // Since we've already updated the local state and localStorage,
        // just inform the user that it's only saved locally
        if (!isSaved) {
          setError("Roadmap saved locally (server sync failed)");
        } else {
          setError("Roadmap removed locally (server sync failed)");
        }
        
        // Create a memory of this failed API call for analytics
        try {
          const failedApiData = {
            endpoint: isSaved ? `/roadmap/unsave/${roadmapId}` : `/roadmap/save`,
            timestamp: new Date().toISOString(),
            error: apiError.message || 'Unknown error',
            roadmapId: roadmapId
          };
          
          const failedApiCalls = JSON.parse(localStorage.getItem('failedApiCalls') || '[]');
          failedApiCalls.push(failedApiData);
          localStorage.setItem('failedApiCalls', JSON.stringify(failedApiCalls));
        } catch (storageError) {
          console.error("Error storing failed API call data:", storageError);
        }
      }
      
      // Clear error message after a delay
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Unexpected error in toggleSaveRoadmap:", error);
      setError("An unexpected error occurred. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Function to check if a roadmap is saved
  const isRoadmapSaved = (roadmapId) => {
    return savedRoadmaps.includes(roadmapId);
  };

  // Improved search functionality
  const filterCompanies = useCallback((query) => {
    if (!query || query.trim() === '') {
      return companies || [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    console.log("Normalized search query:", normalizedQuery);
    
    if (!companies || !Array.isArray(companies)) {
      console.log("Companies array is invalid", companies);
      return [];
    }
    
    return companies.filter(company => {
      if (!company) return false;
      
      // Fix: Check for companyname instead of name
      const companyName = (company.companyname || company.name || '').toLowerCase();
      const jobProfile = (company.jobprofile || '').toLowerCase();
      
      const nameMatch = companyName.includes(normalizedQuery);
      const profileMatch = jobProfile.includes(normalizedQuery);
      
      return nameMatch || profileMatch;
    });
  }, [companies]);
  
  // Filter companies based on search query
  const filteredCompanies = companies && companies.length > 0 ? filterCompanies(searchQuery) : [];
  
  // Single useEffect for logging state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("State updated:", { 
        companiesLength: companies?.length,
        searchQuery,
        filteredCompaniesLength: filteredCompanies?.length,
        loading,
        selectedCompany
      });
    }
    
    // Return cleanup to detect unmounting
    return () => {
      console.log("PlacementMaterialPage unmounting");
    };
  }, [companies, searchQuery, filteredCompanies, loading, selectedCompany]);

  // Make handleCompanySelect async
  const handleCompanySelect = async (companyId) => {
    setSelectedCompany(companyId);
    setSelectedRoadmap(null);
    
    try {
      const response = await axios.get(`/roadmap/company/${companyId}`);
      if (response.data && response.data.roadmaps && response.data.roadmaps.length > 0) {
          // If roadmaps exist for this company, update the roadmaps state
          const companyRoadmaps = response.data.roadmaps;
          setRoadmaps(prevRoadmaps => {
            // Filter out any existing roadmaps for this company and add the new ones
          const filteredRoadmaps = prevRoadmaps.filter(rm => rm && rm.companyId && rm.companyId._id !== companyId);
            return [...filteredRoadmaps, ...companyRoadmaps];
          });
        } else {
        // If no roadmaps exist, create sample roadmap data
        const company = companies.find(c => c && c._id === companyId);
          if (company) {
          // Create a sample roadmap for this company
          const sampleRoadmap = {
            _id: `sample-roadmap-${companyId}`,
            title: `${company.companyname || company.name} Career Path`,
            description: `A comprehensive learning roadmap for ${company.jobprofile} roles at ${company.companyname || company.name}.`,
            companyId: { _id: companyId, name: company.companyname || company.name },
            skills: [
              {
                _id: "skill-1",
                name: "Technical Skills",
                description: "Essential technical skills required for this role",
                resources: [
                  {
                    _id: "resource-1",
                    title: "Programming Fundamentals",
                    description: "Learn the core concepts of programming and problem-solving.",
                    link: "https://www.freecodecamp.org/learn"
                  },
                  {
                    _id: "resource-2",
                    title: "Data Structures & Algorithms",
                    description: "Master common data structures and algorithms for technical interviews.",
                    link: "https://leetcode.com/"
                  },
                  {
                    _id: "resource-3",
                    title: "System Design",
                    description: "Learn how to design scalable systems and architecture.",
                    link: "https://www.educative.io/path/scalability-system-design"
                  }
                ]
              },
              {
                _id: "skill-2",
                name: "Soft Skills",
                description: "Important non-technical skills for career growth",
                resources: [
                  {
                    _id: "resource-4",
                    title: "Communication Skills",
                    description: "Improve your verbal and written communication abilities.",
                    link: "https://www.coursera.org/learn/communication-skills-engineers"
                  },
                  {
                    _id: "resource-5",
                    title: "Teamwork & Collaboration",
                    description: "Learn effective strategies for working in cross-functional teams.",
                    link: "https://www.linkedin.com/learning/teamwork-foundations-2020"
                  }
                ]
              },
              {
                _id: "skill-3",
                name: `${company.companyname || company.name} Specific Knowledge`,
                description: `Learn about ${company.companyname || company.name}'s products, culture, and interview process`,
                resources: [
                  {
                    _id: "resource-6",
                    title: "Company Overview",
                    description: `Understand ${company.companyname || company.name}'s business model, products, and services.`,
                    link: (company.companyname || company.name) === "Google" ? "https://about.google/" :
                          (company.companyname || company.name) === "Microsoft" ? "https://www.microsoft.com/en-us/about" :
                          (company.companyname || company.name) === "Amazon" ? "https://www.aboutamazon.com/" :
                          (company.companyname || company.name) === "Apple" ? "https://www.apple.com/about/" :
                          "https://about.meta.com/"
                  },
                  {
                    _id: "resource-7",
                    title: "Interview Preparation",
                    description: `Tips and practice questions specific to ${company.companyname || company.name} interviews.`,
                    link: "https://www.interviewcake.com/"
                  }
                ]
              }
            ]
          };
          
          // Add this sample roadmap to state
          setRoadmaps(prevRoadmaps => [...prevRoadmaps, sampleRoadmap]);
        }
      }
    } catch (err) {
      console.error("Error fetching company roadmaps:", err);
      setError("Failed to load roadmaps. Using sample data instead.");
      
      // Create sample roadmap in case of error
      const company = companies.find(c => c && c._id === companyId);
      if (company) {
        // Extract company name and job profile from company object
        const companyName = company.companyname || company.name || "the company";
        const jobProfile = company.jobprofile || "the role";
        
        // Generate skills based on job profile and roles
        const sampleSkills = [];
        
        // First check if company has roles and responsibilities
        if (company.rolesAndResponsibilities && company.rolesAndResponsibilities.length > 0) {
          // Map common keywords in roles to relevant skills
          const roleKeywordMap = {
            'frontend': ['HTML/CSS', 'JavaScript', 'React', 'UI Design'],
            'backend': ['Node.js', 'Express', 'Databases', 'API Design'],
            'full stack': ['JavaScript', 'React', 'Node.js', 'Databases'],
            'data': ['Python', 'SQL', 'Data Analysis', 'Statistics'],
            'security': ['Network Security', 'Encryption', 'Cybersecurity Frameworks', 'Security Protocols'],
            'cloud': ['AWS', 'Azure', 'Docker', 'Kubernetes'],
            'mobile': ['React Native', 'iOS', 'Android', 'Mobile UI Design'],
            'devops': ['CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code']
          };
          
          // Extract skills from roles
          const detectedSkills = new Set();
          
          company.rolesAndResponsibilities.forEach(role => {
            const roleLower = role.toLowerCase();
            
            // Check if role contains any of our mapped keywords
            Object.keys(roleKeywordMap).forEach(keyword => {
              if (roleLower.includes(keyword)) {
                roleKeywordMap[keyword].forEach(skill => detectedSkills.add(skill));
              }
            });
            
            // Also check for specific technologies mentioned directly in the role
            const techKeywords = [
              'React', 'Angular', 'Vue', 'Node', 'Python', 'Java', 'C#', '.NET',
              'SQL', 'MongoDB', 'Database', 'AWS', 'Azure', 'GCP', 'Docker'
            ];
            
            techKeywords.forEach(tech => {
              if (roleLower.includes(tech.toLowerCase())) {
                detectedSkills.add(tech);
              }
            });
          });
          
          // Add detected skills to the sample skills list
          Array.from(detectedSkills).forEach(skillName => {
            sampleSkills.push({
              _id: `skill-${skillName.replace(/[^a-zA-Z0-9]/g, '')}`,
              name: skillName,
              description: `Master ${skillName} skills required for ${jobProfile} roles at ${companyName}.`,
              resources: generateSampleResources(skillName)
            });
          });
        }
        
        // If no skills detected from roles, fall back to job profile-based skills
        if (sampleSkills.length === 0) {
          // Determine skills based on job profile
          let skillsForProfile = [];
          
          const jobProfileLower = jobProfile.toLowerCase();
          if (jobProfileLower.includes('frontend') || jobProfileLower.includes('ui')) {
            skillsForProfile = ['HTML/CSS', 'JavaScript', 'React', 'UI/UX Design'];
          } else if (jobProfileLower.includes('backend')) {
            skillsForProfile = ['Node.js', 'Java', 'Databases', 'API Design'];
          } else if (jobProfileLower.includes('full') && jobProfileLower.includes('stack')) {
            skillsForProfile = ['JavaScript', 'React', 'Node.js', 'Databases'];
          } else if (jobProfileLower.includes('data')) {
            skillsForProfile = ['Python', 'SQL', 'Data Analysis', 'Machine Learning'];
          } else if (jobProfileLower.includes('security')) {
            skillsForProfile = ['Network Security', 'Encryption', 'Security Protocols', 'Ethical Hacking'];
          } else if (jobProfileLower.includes('cloud')) {
            skillsForProfile = ['AWS', 'Azure', 'Cloud Architecture', 'DevOps'];
          } else {
            // Default skills for general software roles
            skillsForProfile = ['Programming Fundamentals', 'Data Structures & Algorithms', 'System Design', 'Problem Solving'];
          }
          
          // Create skill objects
          skillsForProfile.forEach(skillName => {
            sampleSkills.push({
              _id: `skill-${skillName.replace(/[^a-zA-Z0-9]/g, '')}`,
              name: skillName,
              description: `Master ${skillName} skills required for ${jobProfile} roles at ${companyName}.`,
              resources: generateSampleResources(skillName)
            });
          });
        }
        
        // Create a sample roadmap for this company
        const sampleRoadmap = {
          _id: `sample-roadmap-${companyId}`,
          companyId: company,
          jobProfile: jobProfile,
          description: `A comprehensive learning roadmap for ${jobProfile} roles at ${companyName}.`,
          title: `${company.name} Career Path`,
          skills: sampleSkills
        };
        
        // Add this sample roadmap to state
        setRoadmaps(prevRoadmaps => [...prevRoadmaps, sampleRoadmap]);
      }
    }
  };

  // Make this a synchronous function that returns static resources
  const generateSampleResources = (skillName) => {
    // Get static resources for this skill
    const resources = [];
    
    // Add video tutorials
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource1`,
      title: `${skillName} for Beginners`,
      type: 'video',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skillName} tutorial for beginners`)}`,
      description: `Comprehensive tutorial for learning ${skillName} fundamentals.`
    });
    
    // Add documentation and articles
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource3`,
      title: `${skillName} Documentation`,
      type: 'article',
      url: `https://www.google.com/search?q=${encodeURIComponent(`${skillName} documentation official guide`)}`,
      description: `Official documentation and guides for learning ${skillName}.`
    });
    
    // Add interview preparation resources
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource5`,
      title: `${skillName} Interview Questions`,
      type: 'article',
      url: `https://www.google.com/search?q=${encodeURIComponent(`${skillName} interview questions answers`)}`,
      description: `Common ${skillName} interview questions with detailed answers to help you prepare.`
    });
    
    return resources;
  };

  // Function to handle custom roadmap generation based on user input
  const handleCustomRoadmapGeneration = async (e) => {
    e.preventDefault();
    setGeneratingRoadmap(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!customCompanyName || !customJobProfile || !customRoles) {
        setError("Please fill in all fields to generate a roadmap");
        setGeneratingRoadmap(false);
        return;
      }
      
      // Split roles into an array
      const rolesArray = customRoles.split('\n').map(role => role.trim()).filter(role => role !== '');
      
      // First try to generate roadmap using the backend API
      try {
        const response = await axios.post("/roadmap/generate", {
          companyName: customCompanyName,
          jobProfile: customJobProfile,
          rolesAndResponsibilities: rolesArray
        });
        
      if (response.data && response.data.roadmap) {
          setCustomRoadmap(response.data.roadmap);
          setGeneratingRoadmap(false);
          return;
        }
      } catch (apiError) {
        // If API call fails, generate client-side roadmap
        console.log("API-based roadmap generation failed, falling back to client-side generation");
      }
      
      // Generate client-side roadmap as fallback
      const sampleSkills = [];
      
      // Map common keywords in roles to relevant skills
      const roleKeywordMap = {
        'frontend': ['HTML/CSS', 'JavaScript', 'React', 'UI Design'],
        'backend': ['Node.js', 'Express', 'Databases', 'API Design'],
        'full stack': ['JavaScript', 'React', 'Node.js', 'Databases'],
        'data': ['Python', 'SQL', 'Data Analysis', 'Statistics'],
        'security': ['Network Security', 'Encryption', 'Cybersecurity Frameworks', 'Security Protocols'],
        'cloud': ['AWS', 'Azure', 'Docker', 'Kubernetes'],
        'mobile': ['React Native', 'iOS', 'Android', 'Mobile UI Design'],
        'devops': ['CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code'],
        'ai': ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
        'web': ['HTML', 'CSS', 'JavaScript', 'Responsive Design']
      };
      
      // Extract skills from roles
      const detectedSkills = new Set();
      
      rolesArray.forEach(role => {
        const roleLower = role.toLowerCase();
        
        // Check if role contains any of our mapped keywords
        Object.keys(roleKeywordMap).forEach(keyword => {
          if (roleLower.includes(keyword)) {
            roleKeywordMap[keyword].forEach(skill => detectedSkills.add(skill));
          }
        });
        
        // Also check for specific technologies mentioned directly in the role
        const techKeywords = [
          'React', 'Angular', 'Vue', 'Node', 'Python', 'Java', 'C#', '.NET',
          'SQL', 'MongoDB', 'Database', 'AWS', 'Azure', 'GCP', 'Docker',
          'JavaScript', 'TypeScript', 'HTML', 'CSS', 'PHP', 'Ruby', 'Go',
          'UI', 'UX', 'API', 'REST', 'GraphQL', 'Microservices', 'ML', 'AI'
        ];
        
        techKeywords.forEach(tech => {
          if (roleLower.includes(tech.toLowerCase())) {
            detectedSkills.add(tech);
          }
        });
      });
      
      // Add detected skills to the sample skills list
      Array.from(detectedSkills).forEach(skillName => {
        sampleSkills.push({
          _id: `skill-${skillName.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: skillName,
          description: `Master ${skillName} skills required for ${customJobProfile} roles at ${customCompanyName}.`,
          resources: generateSampleResources(skillName)
        });
      });
      
      // If no skills detected from roles, fall back to job profile-based skills
      if (sampleSkills.length === 0) {
        // Determine skills based on job profile
        let skillsForProfile = [];
        
        const jobProfileLower = customJobProfile.toLowerCase();
        if (jobProfileLower.includes('frontend') || jobProfileLower.includes('ui')) {
          skillsForProfile = ['HTML/CSS', 'JavaScript', 'React', 'UI/UX Design'];
        } else if (jobProfileLower.includes('backend')) {
          skillsForProfile = ['Node.js', 'Java', 'Databases', 'API Design'];
        } else if (jobProfileLower.includes('full') && jobProfileLower.includes('stack')) {
          skillsForProfile = ['JavaScript', 'React', 'Node.js', 'Databases'];
        } else if (jobProfileLower.includes('data')) {
          skillsForProfile = ['Python', 'SQL', 'Data Analysis', 'Machine Learning'];
        } else if (jobProfileLower.includes('security')) {
          skillsForProfile = ['Network Security', 'Encryption', 'Security Protocols', 'Ethical Hacking'];
        } else if (jobProfileLower.includes('cloud')) {
          skillsForProfile = ['AWS', 'Azure', 'Cloud Architecture', 'DevOps'];
        } else {
          // Default skills for general software roles
          skillsForProfile = ['Programming Fundamentals', 'Data Structures & Algorithms', 'System Design', 'Problem Solving'];
        }
        
        // Create skill objects
        skillsForProfile.forEach(skillName => {
          sampleSkills.push({
            _id: `skill-${skillName.replace(/[^a-zA-Z0-9]/g, '')}`,
            name: skillName,
            description: `Master ${skillName} skills required for ${customJobProfile} roles at ${customCompanyName}.`,
            resources: generateSampleResources(skillName)
          });
        });
      }
      
      // Add some general career development skills
      sampleSkills.push({
        _id: 'skill-careerdev',
        name: 'Career Development',
        description: 'Essential skills for professional growth and career advancement.',
        resources: [
          {
            _id: 'careerdev-resource1',
            title: 'Resume Building Workshop',
            type: 'video',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent('tech resume building tips')}`,
            description: 'Learn how to create an impressive tech resume that highlights your skills and experiences.'
          },
          {
            _id: 'careerdev-resource2',
            title: 'Technical Interview Preparation',
            type: 'course',
            url: 'https://www.coursera.org/learn/cs-tech-interview',
            description: 'Comprehensive course on preparing for technical interviews at top tech companies.'
          },
          {
            _id: 'careerdev-resource3',
            title: 'Negotiation Skills for Job Offers',
            type: 'article',
            url: `https://www.google.com/search?q=${encodeURIComponent('how to negotiate tech job offer')}`,
            description: 'Tips and strategies for negotiating job offers in the tech industry.'
          }
        ]
      });
      
      // Create a custom roadmap
      const generatedRoadmap = {
        _id: `custom-roadmap-${Date.now()}`,
        companyName: customCompanyName,
        jobProfile: customJobProfile,
        skills: sampleSkills,
        rolesAndResponsibilities: rolesArray,
        description: `A personalized learning roadmap for ${customJobProfile} roles at ${customCompanyName}.`,
        createdAt: new Date().toISOString()
      };
      
      setCustomRoadmap(generatedRoadmap);
    } catch (error) {
      console.error("Error generating custom roadmap:", error);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleRoadmapSelect = async (roadmapId) => {
    setSelectedRoadmap(roadmapId);
    
    try {
      const response = await axios.get(`/roadmap/${roadmapId}`);
      if (response.data) {
        // Update the selected roadmap with detailed information
        setRoadmaps(prevRoadmaps => {
          return prevRoadmaps.map(rm => {
            if (rm._id === roadmapId) {
              return response.data.roadmap;
            }
            return rm;
          });
        });
        
        // Set user progress if available
        if (response.data.userProgress) {
          setUserProgress(prevProgress => ({
            ...prevProgress,
            [roadmapId]: response.data.userProgress
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching roadmap details:", err);
      setError("Failed to load roadmap details. Please try again later.");
    }
  };

  // Update the navigateToCompanyRoadmap function
  const navigateToCompanyRoadmap = async (companyId) => {
    // Show message for placeholder companies
    if (companyId.includes('placeholder')) {
      setError("We're currently developing detailed roadmaps for this company. Please check back soon or explore our general resources.");
      setTimeout(() => {
        setError(null);
      }, 5000);
      return;
    }
    
    // For real companies, use existing functionality
    setSelectedCompany(companyId);
    await handleCompanySelect(companyId);
    
    // Scroll to the top of the page for better user experience
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleResourceCompletion = async (roadmapId, resourceId, completed) => {
    try {
      const response = await axios.post("/roadmap/progress", {
        roadmapId,
        resourceId,
        completed
      });
      
      if (response.data && response.data.userProgress) {
        // Update user progress state
        setUserProgress(prevProgress => ({
          ...prevProgress,
          [roadmapId]: response.data.userProgress
        }));
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      setError("Failed to update progress. Please try again later.");
    }
  };

  const calculateProgress = (roadmapId, skillResources = []) => {
    if (!roadmapId || !skillResources || !Array.isArray(skillResources) || !userProgress[roadmapId] || !userProgress[roadmapId].completedResources) {
      return 0;
    }
    
    const completedResources = userProgress[roadmapId].completedResources;
    const totalResources = skillResources.length;
    
    if (totalResources === 0) return 0;
    
    const completedCount = skillResources.filter(resource => 
      resource && resource._id && completedResources.includes(resource._id)
    ).length;
    
    return Math.round((completedCount / totalResources) * 100);
  };

  // General placement resources
  const generalResources = [
    {
      id: 1,
      title: "Resume Building Guide",
      description: "Learn how to create an ATS-friendly resume that highlights your skills and experiences effectively.",
      link: "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-build-a-resume",
      type: "article"
    },
    {
      id: 2,
      title: "Technical Interview Preparation",
      description: "Comprehensive guide to ace technical interviews with common questions and solutions.",
      link: "https://www.interviewbit.com/",
      type: "resource"
    },
    {
      id: 3,
      title: "Behavioral Interview Questions",
      description: "Practice the most common behavioral questions asked during interviews with example answers.",
      link: "https://www.themuse.com/advice/behavioral-interview-questions-answers-examples",
      type: "article"
    },
    {
      id: 4,
      title: "LinkedIn Profile Optimization",
      description: "Learn how to optimize your LinkedIn profile to attract recruiters and job opportunities.",
      link: "https://www.linkedin.com/business/talent/blog/product-tips/linkedin-profile-tips-students",
      type: "guide"
    },
    {
      id: 5,
      title: "Negotiating Job Offers",
      description: "Tips and strategies for negotiating salary and benefits during job offers.",
      link: "https://hbr.org/2014/04/15-rules-for-negotiating-a-job-offer",
      type: "article"
    }
  ];

  // Interview preparation tips
  const interviewTips = [
    {
      id: 1,
      title: "Research the Company",
      description: "Always research the company's products, services, culture, and recent news before an interview.",
    },
    {
      id: 2,
      title: "Prepare Your Stories",
      description: "Prepare specific examples and stories from your experience that demonstrate your skills and achievements.",
    },
    {
      id: 3,
      title: "Practice Technical Problems",
      description: "For technical roles, practice coding problems, system design, and other technical aspects relevant to the position.",
    },
    {
      id: 4,
      title: "Prepare Questions",
      description: "Have thoughtful questions ready to ask the interviewer about the role, team, and company.",
    },
    {
      id: 5,
      title: "Mock Interviews",
      description: "Conduct mock interviews with friends, mentors, or using online platforms to improve your interview skills.",
    },
    {
      id: 6,
      title: "Body Language",
      description: "Practice good posture, eye contact, and confident body language to make a positive impression.",
    },
    {
      id: 7,
      title: "Follow Up",
      description: "Send a thank-you email within 24 hours after the interview to express your appreciation and reiterate your interest.",
    }
  ];

  const renderResourcesTab = () => {
    const resources = [
      {
        id: 1,
        title: "Data Structures & Algorithms",
        description: "Master the fundamentals of DS&A with these comprehensive resources that cover all important topics for technical interviews.",
        link: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        type: "video"
      },
      {
        id: 2,
        title: "System Design Fundamentals",
        description: "Learn how to design scalable systems. Essential for software engineering roles at top companies.",
        link: "https://www.youtube.com/watch?v=SqYmAX0crME",
        type: "video"
      },
      {
        id: 3,
        title: "LeetCode Top Interview Questions",
        description: "Practice the most frequently asked coding interview questions from top tech companies.",
        link: "https://leetcode.com/explore/interview/card/top-interview-questions-medium/",
        type: "resource"
      },
      {
        id: 4,
        title: "Resume Building Guide",
        description: "Tips and templates for creating a standout technical resume that will get you past the ATS and impress recruiters.",
        link: "https://www.youtube.com/watch?v=y8YH0Qbu5h4",
        type: "video"
      },
      {
        id: 5,
        title: "Behavioral Interview Preparation",
        description: "How to prepare for and answer behavioral questions using the STAR method with real examples.",
        link: "https://www.youtube.com/watch?v=ri8SnErIDQs",
        type: "video"
      },
      {
        id: 6,
        title: "Tech Interview Handbook",
        description: "A comprehensive guide that covers all aspects of the tech interview process from preparation to negotiation.",
        link: "https://techinterviewhandbook.org/",
        type: "resource"
      }
    ];

    return (
      <div className="resources-tab">
        <h2>General Placement Resources</h2>
        <p className="resources-intro">Explore these curated resources to help you prepare for your placement journey. These materials cover technical, behavioral, and practical aspects of the job search process.</p>
        
        <div className="resources-list">
          {resources.map(resource => (
            <div key={resource.id} className="resource-card">
              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">
                <i className={resource.type === 'video' ? "fas fa-play-circle" : "fas fa-external-link-alt"}></i>
                {resource.type === 'video' ? ' Start Video Tutorial' : ' Explore Resource'}
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInterviewTab = () => {
    const interviewTips = [
      {
        id: 1,
        category: "Technical",
        tips: [
          "Practice with a timer to simulate real interview conditions",
          "Explain your thought process out loud as you solve problems",
          "Review time and space complexity for all your solutions",
          "Have a systematic approach to problem-solving"
        ]
      },
      {
        id: 2,
        category: "Behavioral",
        tips: [
          "Prepare stories using the STAR method (Situation, Task, Action, Result)",
          "Research the company's values and align your answers accordingly",
          "Have specific examples of teamwork, leadership, and conflict resolution",
          "Prepare questions to ask the interviewer about the company and role"
        ]
      },
      {
        id: 3,
        category: "Communication",
        tips: [
          "Use clear and concise language to explain technical concepts",
          "Listen carefully to the interviewer's questions and clarify if needed",
          "Maintain good eye contact and positive body language",
          "Show enthusiasm and a genuine interest in the role"
        ]
      }
    ];

    return (
      <div className="interview-tab">
        <h2>Interview Preparation Guide</h2>
        <p className="interview-intro">Preparing for technical and behavioral interviews requires strategy and practice. Use these tips to maximize your chances of success.</p>
        
        <div className="interview-sections">
          {interviewTips.map(section => (
            <div key={section.id} className="interview-section">
              <h3 className="section-title">
                <i className={`fas fa-${section.category === "Technical" ? "code" : 
                              section.category === "Behavioral" ? "user-tie" : "comments"}`}></i> 
                {section.category} Skills
              </h3>
              <ul className="tips-list">
                {section.tips.map((tip, index) => (
                  <li key={index} className="tip-item">
                    <i className="fas fa-check-circle"></i> {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mock-interview-section">
          <h3><i className="fas fa-video"></i> Schedule a Mock Interview</h3>
          <p>Practice makes perfect! Schedule a mock interview with one of our mentors to get personalized feedback on your performance.</p>
          <button className="schedule-btn">Book a Session</button>
        </div>
      </div>
    );
  };

  // New function to render the custom roadmap generator tab
  const renderCustomRoadmapTab = () => {
    return (
      <div className="custom-roadmap-tab">
        <h2 className="section-heading">Custom Roadmap Generator</h2>
        <p className="section-description">
          Create a personalized learning roadmap by providing details about a company and role you're interested in.
          Our AI will analyze the roles and responsibilities to generate a tailored learning path.
        </p>
        
        <div className="custom-roadmap-container">
          <div className="custom-roadmap-form-container">
            <form onSubmit={handleCustomRoadmapGeneration} className="custom-roadmap-form">
              <div className="form-group">
                <label htmlFor="customCompanyName">Company Name</label>
                <input
                  type="text"
                  id="customCompanyName"
                  className="form-control"
                  placeholder="e.g. Google, Microsoft, Amazon"
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customJobProfile">Job Profile</label>
                <input
                  type="text"
                  id="customJobProfile"
                  className="form-control"
                  placeholder="e.g. Frontend Developer, Data Scientist"
                  value={customJobProfile}
                  onChange={(e) => setCustomJobProfile(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customRoles">Roles and Responsibilities</label>
                <textarea
                  id="customRoles"
                  className="form-control"
                  placeholder="Enter each role and responsibility on a new line, e.g.:
Develop responsive web interfaces using React
Design and implement RESTful APIs
Work with cloud infrastructure on AWS"
                  value={customRoles}
                  onChange={(e) => setCustomRoles(e.target.value)}
                  rows={6}
                  required
                />
                <small className="form-text text-muted">
                  The more detailed you are, the more tailored your roadmap will be.
                </small>
              </div>
              
              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="generate-roadmap-btn"
                  disabled={generatingRoadmap}
                >
                  {generatingRoadmap ? (
                    <span>Generating Roadmap...</span>
                  ) : (
                    <span>Generate Roadmap</span>
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="reset-form-btn"
                  onClick={() => {
                    setCustomCompanyName('');
                    setCustomJobProfile('');
                    setCustomRoles('');
                    setCustomRoadmap(null);
                    setError(null);
                  }}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
          
          {customRoadmap && (
            <div className="custom-roadmap-result">
              <div className="custom-roadmap-header">
                <h3 className="custom-roadmap-title">
                  {customRoadmap.jobProfile} at {customRoadmap.companyName}
                </h3>
                
                <button 
                  className="save-custom-roadmap-btn"
                  onClick={async () => {
                    try {
                      // Save custom roadmap to the database first
                      const response = await axios.post("/roadmap/generate", {
                        companyName: customCompanyName,
                        jobProfile: customJobProfile,
                        rolesAndResponsibilities: customRoadmap.rolesAndResponsibilities
                      });
                      
                      if (response.data && response.data.roadmap && response.data.roadmap._id) {
                        // Then save it to the user's profile
                        await toggleSaveRoadmap(response.data.roadmap._id);
                      }
                    } catch (err) {
                      console.error("Error saving custom roadmap:", err);
                      setError("Failed to save custom roadmap. Please try again.");
                    }
                  }}
                >
                  <i className="fas fa-bookmark"></i> Save to Profile
                </button>
              </div>
              
              <p className="custom-roadmap-description">{customRoadmap.description}</p>
              
              {customRoadmap.rolesAndResponsibilities && customRoadmap.rolesAndResponsibilities.length > 0 && (
                <div className="roles-section">
                  <h5 className="roles-heading"><i className="fas fa-tasks"></i> Key Roles & Responsibilities</h5>
                  <ul className="roles-list">
                    {customRoadmap.rolesAndResponsibilities.map((role, index) => (
                      <li key={index} className="role-item">
                        <span className="role-bullet">•</span> {role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {customRoadmap.skills && customRoadmap.skills.length > 0 ? (
                <div className="skills-section">
                  {customRoadmap.skills.map(skill => (
                    <div key={skill._id} className="skill-card">
                      <h5 className="skill-name">
                        <i className="fas fa-star"></i> {skill.name}
                      </h5>
                      <p className="skill-description">{skill.description}</p>
                      
                      {skill.resources && skill.resources.length > 0 ? (
                        <div className="skill-resources">
                          <h6>Learning Resources:</h6>
                          <div className="resources-grid">
                            {skill.resources.map(resource => (
                              <div key={resource._id} className="resource-card">
                                <div className="resource-type-badge">
                                  {resource.type === 'video' ? (
                                    <i className="fas fa-video"></i>
                                  ) : resource.type === 'course' ? (
                                    <i className="fas fa-graduation-cap"></i>
                                  ) : (
                                    <i className="fas fa-file-alt"></i>
                                  )}
                                  {' '}{resource.type}
                                </div>
                                <h6 className="resource-title">{resource.title}</h6>
                                {resource.platform && (
                                  <span className="resource-platform">
                                    <i className="fas fa-university"></i> {resource.platform}
                                  </span>
                                )}
                                <p className="resource-description">{resource.description}</p>
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="resource-link"
                                >
                                  <i className={resource.type === 'video' ? "fas fa-play-circle" : "fas fa-external-link-alt"}></i>
                                  {resource.type === 'video' ? ' Start Video Tutorial: ' : ' Access: '} 
                                  {resource.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="no-resources">No resources available for this skill.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-skills-message">
                  <p>No specific skills could be generated. Please try with more detailed roles and responsibilities.</p>
                </div>
              )}
              
              <div className="custom-roadmap-tips">
                <h4>Tips for Success</h4>
                <ul>
                  <li>Start with fundamental skills and build up to more advanced ones</li>
                  <li>Create projects to demonstrate your skills</li>
                  <li>Join online communities related to these technologies</li>
                  <li>Practice explaining these concepts in your own words</li>
                  <li>Set specific goals for each learning resource</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRoadmapsTab = () => {
    return (
      <div className="roadmaps-tab">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search for a company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        {selectedCompany ? (
          <div className="company-roadmap-details">
            <button 
              className="back-button"
              onClick={() => {
                setSelectedCompany(null);
                setSelectedRoadmap(null);
              }}
            >
              <i className="fas fa-arrow-left"></i> Back to Companies
            </button>
            
            {/* Company Info */}
            {companies && companies.find(c => c._id === selectedCompany) && (
              <div className="selected-company-info">
                <h2>{companies.find(c => c._id === selectedCompany).companyname || companies.find(c => c._id === selectedCompany).name}</h2>
                <p className="selected-company-profile">
                  {companies.find(c => c._id === selectedCompany).jobprofile || ''}
                </p>
                <p className="selected-company-description">
                  {companies.find(c => c._id === selectedCompany).jobdescription || companies.find(c => c._id === selectedCompany).description || ''}
                </p>
              </div>
            )}
            
            {/* Roadmap Info */}
            <div className="roadmap-content">
              <h3 className="roadmap-section-title">Learning Roadmap</h3>
              
              {roadmaps
                .filter(roadmap => roadmap && roadmap.companyId && 
                  (roadmap.companyId._id === selectedCompany || 
                   roadmap.companyId === selectedCompany))
                .map(roadmap => (
                  <div key={roadmap._id} className="roadmap-item">
                    <div className="roadmap-header">
                      <h4 className="roadmap-title">{roadmap.title || 'Career Preparation Path'}</h4>
                      <div className="roadmap-actions">
                        <button 
                          className={`save-roadmap-btn ${isRoadmapSaved(roadmap._id) ? 'saved' : ''}`}
                          onClick={() => toggleSaveRoadmap(roadmap._id)}
                          title={isRoadmapSaved(roadmap._id) ? "Remove from saved roadmaps" : "Save to your profile"}
                        >
                          <i className={`fas ${isRoadmapSaved(roadmap._id) ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                          {isRoadmapSaved(roadmap._id) ? " Saved to Roadmaps" : " Save to Roadmaps"}
                        </button>
                      </div>
                    </div>
                    <p className="roadmap-description">{roadmap.description || 'Follow this structured learning path to prepare for your interviews.'}</p>

                    {/* Display roles and responsibilities if available */}
                    {roadmap.companyId && roadmap.companyId.rolesAndResponsibilities && roadmap.companyId.rolesAndResponsibilities.length > 0 && (
                      <div className="roles-section">
                        <h5 className="roles-heading"><i className="fas fa-tasks"></i> Key Roles & Responsibilities</h5>
                        <ul className="roles-list">
                          {roadmap.companyId.rolesAndResponsibilities.map((role, index) => (
                            <li key={index} className="role-item">
                              <span className="role-bullet">•</span> {role}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {roadmap.skills && roadmap.skills.length > 0 ? (
                      <div className="skills-section">
                        {roadmap.skills.map(skill => (
                          <div key={skill._id} className="skill-card">
                            <h5 className="skill-name">
                              <i className="fas fa-star"></i> {skill.name}
                            </h5>
                            <p className="skill-description">{skill.description}</p>
                            
                            {skill.resources && skill.resources.length > 0 ? (
                              <div className="skill-resources">
                                <h6>Resources:</h6>
                                <ul className="resources-list-compact">
                                  {skill.resources.map(resource => (
                                    <li key={resource._id} className="resource-item-compact">
                                      <a 
                                        href={resource.link || resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="resource-link-compact"
                                      >
                                        <i className={resource.type === 'video' ? "fas fa-play-circle" : "fas fa-external-link-alt"}></i>
                                        {resource.type === 'video' ? ' Start Video Tutorial: ' : ' '} 
                                        {resource.title}
                                      </a>
                                      <p className="resource-desc-compact">{resource.description}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="no-resources">No resources available for this skill yet.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-skills-message">
                        <p>No specific skills defined for this roadmap yet. We're working on adding detailed content.</p>
                      </div>
                    )}
                  </div>
                ))}
                
              {roadmaps.filter(roadmap => 
                roadmap && roadmap.companyId && 
                (roadmap.companyId._id === selectedCompany || 
                 roadmap.companyId === selectedCompany)).length === 0 && (
                <div className="no-roadmaps-message">
                  <p>We're still developing roadmaps for this company. Please check back soon or explore our general resources.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <h2 className="section-heading">Company-Specific Placement Roadmaps</h2>
            <p className="section-description">
              Select a company to view tailored preparation materials, practice questions, 
              and interview insights specific to their recruitment process.
            </p>
            
            <div className="companies-grid" ref={companiesGridRef} style={{ 
                 minHeight: '400px',
                 position: 'relative',
                 zIndex: 10,
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                 gap: '20px'
               }}>
              {console.log("Companies rendering:", companies)}
              {console.log("Filtered companies:", filteredCompanies)}
              
              {filteredCompanies && filteredCompanies.length > 0 ? (
                // Map through filtered companies
                filteredCompanies.map(company => {
                  console.log("Rendering company:", company);
                  // Ensure we have a valid company object
                  if (!company || !company._id) {
                    return null;
                  }
                  
                  return (
                    <div 
                      key={company._id} 
                      className="company-card" 
                      onClick={() => navigateToCompanyRoadmap(company._id)}
                      style={{
                        display: 'block',
                        visibility: 'visible',
                        background: '#e74c3c',
                        border: '3px solid #000',
                        padding: '20px',
                        borderRadius: '10px',
                        margin: '0 0 20px 0',
                        position: 'relative',
                        zIndex: 20
                      }}
                    >
                      <h3 style={{color: '#fff', fontWeight: 'bold'}}>{company.companyname || "Company Name"}</h3>
                      <p className="job-profile" style={{color: '#f1c40f', fontWeight: 'bold'}}>{company.jobprofile || "Job Profile"}</p>
                      <p style={{color: '#fff'}}>{truncateText(company.jobdescription || "Job description not available", 120)}</p>
                      <button className="view-roadmap-btn" style={{
                        background: '#2ecc71',
                        color: '#000',
                        padding: '10px',
                        width: '100%',
                        borderRadius: '5px',
                        border: '2px solid #000',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>View Roadmap</button>
                    </div>
                  );
                })
              ) : loading ? (
                // Show loading message
                <div className="loading-container" style={{textAlign: 'center', padding: '30px', width: '100%'}}>
                  <div className="spinner" style={{marginBottom: '10px'}}>Loading...</div>
                  <p>Loading companies data...</p>
                </div>
              ) : (
                // If no companies are found and not loading, show mock examples for testing
                <>
                  <div className="no-companies-message">
                    <p>No companies found matching your search criteria or API returned no data.</p>
                    <p>Please try a different search term or check back later for updated listings.</p>
                  </div>
                  
                  {/* Add some mock cards for testing/debugging */}
                  <div className="company-card" style={{
                    display: 'block',
                    visibility: 'visible',
                    background: '#e74c3c',
                    border: '3px solid #000',
                    padding: '20px',
                    borderRadius: '10px',
                    margin: '0 0 20px 0',
                    position: 'relative',
                    zIndex: 20
                  }}>
                    <h3 style={{color: '#fff', fontWeight: 'bold'}}>TEST CARD 1</h3>
                    <p className="job-profile" style={{color: '#f1c40f', fontWeight: 'bold'}}>Software Engineer</p>
                    <p style={{color: '#fff'}}>This is a test card to help debug visibility issues. If you can see this, the styling is working.</p>
                    <button className="view-roadmap-btn" style={{
                      background: '#2ecc71',
                      color: '#000',
                      padding: '10px',
                      width: '100%',
                      borderRadius: '5px',
                      border: '2px solid #000',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>View Roadmap</button>
                  </div>
                  
                  <div className="company-card" style={{
                    display: 'block',
                    visibility: 'visible',
                    background: '#e74c3c',
                    border: '3px solid #000',
                    padding: '20px',
                    borderRadius: '10px',
                    margin: '0 0 20px 0',
                    position: 'relative',
                    zIndex: 20
                  }}>
                    <h3 style={{color: '#fff', fontWeight: 'bold'}}>TEST CARD 2</h3>
                    <p className="job-profile" style={{color: '#f1c40f', fontWeight: 'bold'}}>Data Scientist</p>
                    <p style={{color: '#fff'}}>This is another test card with bright styling to ensure visibility.</p>
                    <button className="view-roadmap-btn" style={{
                      background: '#2ecc71',
                      color: '#000',
                      padding: '10px',
                      width: '100%',
                      borderRadius: '5px',
                      border: '2px solid #000',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>View Roadmap</button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roadmaps':
        return renderRoadmapsTab();
      case 'resources':
        return renderResourcesTab();
      case 'interview':
        return renderInterviewTab();
      case 'custom':
        return renderCustomRoadmapTab();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // Add a special effect to force rerender of company cards after page load
  useEffect(() => {
    // This function will force the cards to be visible after a short delay
    const forceCardsVisible = () => {
      console.log("Forcing company cards to be visible");
      const cards = document.querySelectorAll('.company-card');
      
      // If there are cards, ensure they're visible
      if (cards.length > 0) {
        cards.forEach(card => {
          card.style.display = 'block';
          card.style.visibility = 'visible';
          card.style.opacity = '1';
          card.style.position = 'relative';
          card.style.zIndex = '999';
          card.style.backgroundColor = '#e74c3c';
          card.style.border = '3px solid #000000';
        });
        console.log(`Applied forced visibility to ${cards.length} cards`);
      } else {
        console.log("No company cards found in DOM to make visible");
      }
    };

    // First check if companies are loaded
    if (companies && companies.length > 0 && !loading) {
      // Run once immediately
      forceCardsVisible();
      
      // Then run again after a short delay (to catch after rendering)
      const timer1 = setTimeout(() => forceCardsVisible(), 500);
      const timer2 = setTimeout(() => forceCardsVisible(), 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [companies, loading, filteredCompanies]);

  return (
    <div className="placement-material-page">
      <Navbar />
      <div className="placement-material-container">
        
        <h1 className="placement-material-heading">Placement Resources</h1>
        <p className="placement-material-intro">
          Prepare for your dream job with our comprehensive placement resources. 
          Explore company-specific roadmaps, create custom learning paths, and track your progress.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="placement-tabs">
          <button 
            className={`tab-button ${activeTab === 'roadmaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmaps')}
          >
            <i className="fas fa-building"></i> Company Roadmaps
          </button>
          <button 
            className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <i className="fas fa-book"></i> General Resources
          </button>
          <button 
            className={`tab-button ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
          >
            <i className="fas fa-user-tie"></i> Interview Preparation
          </button>
          <button 
            className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <i className="fas fa-plus"></i> Custom Roadmap
          </button>
        </div>
        
        <div className="tab-content">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading your personalized placement resources...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PlacementMaterialPage;