import { useState, useEffect, useContext, useCallback } from "react";
import axios from "../../../api/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../../App.js";
import Navbar from "../HomeComponents/Navbar.js";
import Footer from "../HomeComponents/Footer.js";
import "../Home-CSS/Faq.css";
import "./PlacementMaterial.css";

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
  
  // Use the dark mode context
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  
  const navigate = useNavigate();

  // Define loadSampleCompanies first without dependencies
  const loadSampleCompanies = useCallback(() => {
    console.log("Loading sample companies data");
    
    const sampleCompanies = [
      {
        _id: "sample1",
        name: "Google",
        jobprofile: "Software Engineer",
        description: "Join Google's engineering team to work on cutting-edge technology and products used by billions of people worldwide.",
        rolesAndResponsibilities: [
          "Develop and maintain Google's core search algorithms",
          "Design and implement scalable distributed systems",
          "Write efficient, maintainable, and reusable code",
          "Collaborate with cross-functional teams to define and implement product features"
        ]
      },
      {
        _id: "sample2",
        name: "Microsoft",
        jobprofile: "Frontend Developer",
        description: "Build beautiful, fast, and responsive user interfaces for Microsoft's suite of productivity applications.",
        rolesAndResponsibilities: [
          "Create responsive UI components using modern JavaScript frameworks",
          "Implement UI designs with pixel-perfect accuracy and attention to detail",
          "Optimize web applications for maximum performance",
          "Work with UX designers to improve user experience"
        ]
      },
      {
        _id: "sample3",
        name: "Amazon",
        jobprofile: "Full Stack Developer",
        description: "Build and deploy end-to-end solutions for Amazon's e-commerce platform and related services.",
        rolesAndResponsibilities: [
          "Design and develop RESTful APIs and microservices",
          "Create responsive and interactive web applications",
          "Implement database schemas and optimize queries",
          "Participate in all phases of software development lifecycle"
        ]
      },
      {
        _id: "sample4",
        name: "IDFC Bank",
        jobprofile: "Software Developer",
        description: "Develop secure, reliable, and efficient banking software solutions for IDFC Bank's digital platforms.",
        rolesAndResponsibilities: [
          "Develop and maintain banking applications with focus on security",
          "Implement payment processing and transaction management systems",
          "Create data analytics and reporting solutions",
          "Ensure compliance with financial regulations and security standards"
        ]
      },
      {
        _id: "sample5",
        name: "TCS",
        jobprofile: "System Analyst",
        description: "Analyze, design, and implement IT solutions for TCS's global clients across various industries.",
        rolesAndResponsibilities: [
          "Analyze business requirements and translate them into technical specifications",
          "Design and implement enterprise-scale applications",
          "Troubleshoot complex system issues",
          "Provide technical support and documentation"
        ]
      }
    ];
    
    setCompanies(sampleCompanies);
    setLoading(false);
  }, []);

  // Now define fetchCompanies with a dependency on loadSampleCompanies
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get("/auth/getCompanies");
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log("API returned companies:", response.data.data);
        setCompanies(response.data.data);
        setLoading(false);
      } else {
        console.log("API returned no companies, loading samples");
        loadSampleCompanies();
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies. Using sample data instead.");
      loadSampleCompanies();
    }
  }, [loadSampleCompanies]);  // Add loadSampleCompanies as a dependency

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

  useEffect(() => {
    const verifyAndFetchData = async () => {
      try {
        // Start with loading sample data to provide immediate content
        loadSampleCompanies();
        
        const verifyRes = await axios.get("/auth/verify");
        if (!verifyRes.data.status) {
          navigate("/");
          return;
        }
        
        // Then try to fetch real data
        await fetchCompanies();
        await fetchRoadmaps();
        // Fetch saved roadmaps for the user
        await fetchSavedRoadmaps();
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Authentication failed. Please login again.");
        setLoading(false);
        navigate("/");
      }
    };
    verifyAndFetchData();
  }, [navigate, fetchCompanies, fetchRoadmaps, fetchSavedRoadmaps, loadSampleCompanies]);

  // Add function to toggle save roadmap
  const toggleSaveRoadmap = async (roadmapId) => {
    try {
      // Display loading state
      setError("Saving roadmap...");
      
      // Prevent saving sample roadmaps
      if (roadmapId.startsWith('sample')) {
        setError("Cannot save sample roadmaps. Please use a generated roadmap instead.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      const response = await axios.post(`/roadmap/save/${roadmapId}`);
      
      if (response.data) {
        if (response.data.isSaved) {
          setSavedRoadmaps(prev => [...prev, roadmapId]);
          setError("Roadmap saved successfully!");
        } else {
          setSavedRoadmaps(prev => prev.filter(id => id !== roadmapId));
          setError("Roadmap removed from saved items!");
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error saving roadmap:", err);
      
      // Check for specific error types
      if (err.response && err.response.status === 401) {
        setError("Please login to save roadmaps");
      } else if (err.response && err.response.status === 404) {
        setError("Roadmap not found. It may have been deleted.");
      } else {
        setError("Failed to save roadmap. Please try again later.");
      }
      
      // Keep error message visible for a bit longer
      setTimeout(() => setError(null), 5000);
    }
  };

  // Function to check if a roadmap is saved
  const isRoadmapSaved = (roadmapId) => {
    return savedRoadmaps.includes(roadmapId);
  };

  // Improved search functionality
  const filterCompanies = (query) => {
    if (!query || query.trim() === '') {
      return companies;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    console.log("Normalized search query:", normalizedQuery);
    
    return companies.filter(company => {
      if (!company || !company.name) return false;
      
      const companyName = company.name.toLowerCase();
      const jobProfile = company.jobprofile ? company.jobprofile.toLowerCase() : '';
      
      const nameMatch = companyName.includes(normalizedQuery);
      const profileMatch = jobProfile.includes(normalizedQuery);
      
      // Log each company name and whether it matches for debugging
      console.log(`Company: ${companyName}, Query: ${normalizedQuery}, Match: ${nameMatch || profileMatch}`);
      
      return nameMatch || profileMatch;
    });
  };
  
  // Filter companies based on search query
  const filteredCompanies = filterCompanies(searchQuery);

  useEffect(() => {
    console.log("Current companies:", companies);
    console.log("Search query:", searchQuery);
    console.log("Filtered companies:", filteredCompanies);
  }, [companies, searchQuery, filteredCompanies]);

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
            title: `${company.name} Career Path`,
            description: `A comprehensive learning roadmap for ${company.jobprofile} roles at ${company.name}.`,
            companyId: { _id: companyId, name: company.name },
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
                name: `${company.name} Specific Knowledge`,
                description: `Learn about ${company.name}'s products, culture, and interview process`,
                resources: [
                  {
                    _id: "resource-6",
                    title: "Company Overview",
                    description: `Understand ${company.name}'s business model, products, and services.`,
                    link: company.name === "Google" ? "https://about.google/" :
                          company.name === "Microsoft" ? "https://www.microsoft.com/en-us/about" :
                          company.name === "Amazon" ? "https://www.aboutamazon.com/" :
                          company.name === "Apple" ? "https://www.apple.com/about/" :
                          "https://about.meta.com/"
                  },
                  {
                    _id: "resource-7",
                    title: "Interview Preparation",
                    description: `Tips and practice questions specific to ${company.name} interviews.`,
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
        const companyName = company.name || "the company";
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

  // Helper function to generate course recommendations based on skill
  const generateCourseRecommendations = (skillName) => {
    // Map skills to specific course platforms and topics
    const courseMap = {
      'JavaScript': [
        { platform: 'Udemy', title: 'Modern JavaScript From The Beginning', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', description: 'Learn modern JavaScript with this comprehensive course covering ES6+ features and practical projects.' },
        { platform: 'Coursera', title: 'JavaScript for Beginners', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', description: 'University-backed JavaScript course covering fundamentals to advanced concepts.' }
      ],
      'React': [
        { platform: 'Udemy', title: 'React - The Complete Guide', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', description: 'Master React, Redux, Hooks, Context API and build powerful, modern applications.' },
        { platform: 'Scrimba', title: 'The React Bootcamp', url: 'https://www.youtube.com/watch?v=QFaFIcGhPoM', description: 'Interactive React course with coding challenges and real-world projects.' }
      ],
      'Node.js': [
        { platform: 'Udemy', title: 'Node.js API Masterclass', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', description: 'Build an extensive RESTful API using Node.js, Express, MongoDB and more.' },
        { platform: 'edX', title: 'Server-side Development with NodeJS', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', description: 'Learn server-side JavaScript using Node.js, Express, and MongoDB.' }
      ],
      'Python': [
        { platform: 'Coursera', title: 'Python for Everybody', url: 'https://www.youtube.com/watch?v=8DvywoWv6fI', description: 'Start from zero and learn Python programming and data analysis.' },
        { platform: 'edX', title: 'Introduction to Python Programming', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', description: 'Learn the basics of Python programming through hands-on exercises.' }
      ],
      'Machine Learning': [
        { platform: 'Coursera', title: 'Machine Learning by Andrew Ng', url: 'https://www.youtube.com/watch?v=jGwO_UgTS7I', description: 'The most popular machine learning course taught by Stanford professor Andrew Ng.' },
        { platform: 'edX', title: 'Machine Learning Fundamentals', url: 'https://www.youtube.com/watch?v=KNAWp2S3w94', description: 'Learn the core concepts of machine learning and apply them to real-world problems.' }
      ],
      'Cloud': [
        { platform: 'Coursera', title: 'AWS Fundamentals', url: 'https://www.youtube.com/watch?v=ulprqHHWlng', description: 'Comprehensive introduction to AWS cloud services and architecture.' },
        { platform: 'Udemy', title: 'Azure Fundamentals', url: 'https://www.youtube.com/watch?v=NKEFWyqJ5XA', description: 'Prepare for the AZ-900 certification with hands-on Azure training.' }
      ],
      'Data Structures': [
        { platform: 'Coursera', title: 'Data Structures and Algorithms', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', description: 'Master essential data structures and algorithms for coding interviews.' },
        { platform: 'edX', title: 'Algorithms and Data Structures', url: 'https://www.youtube.com/watch?v=8hly31xKli0', description: 'Learn algorithmic techniques and solve computational problems efficiently.' }
      ],
      'HTML/CSS': [
        { platform: 'Udemy', title: 'Web Development Bootcamp', url: 'https://www.youtube.com/watch?v=mU6anWqZJcc', description: 'Complete web development bootcamp covering HTML, CSS, JavaScript and more.' },
        { platform: 'freeCodeCamp', title: 'Responsive Web Design', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', description: 'Learn to create responsive web designs using HTML and CSS from scratch.' }
      ],
      'SQL': [
        { platform: 'Udemy', title: 'The Complete SQL Bootcamp', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', description: 'Master SQL for data analysis and database management with PostgreSQL.' },
        { platform: 'Coursera', title: 'SQL for Data Science', url: 'https://www.youtube.com/watch?v=BPHAr4QGGVE', description: 'Learn how to use SQL for effective data manipulation and analysis.' }
      ],
      'AWS': [
        { platform: 'Coursera', title: 'AWS Fundamentals', url: 'https://www.youtube.com/watch?v=ulprqHHWlng', description: 'Introduction to AWS Cloud Services, architecture, and best practices.' },
        { platform: 'Udemy', title: 'AWS Certified Solutions Architect', url: 'https://www.youtube.com/watch?v=Ia-UEYYR44s', description: 'Comprehensive course to prepare for the AWS Solutions Architect certification.' }
      ]
    };
    
    // Default recommendations if skill is not in the map
    const defaultCourses = [
      {
        _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-course1`,
        title: `${skillName} Essential Training`,
        type: 'video',
        url: `https://www.youtube.com/watch?v=videoseries?search_query=${encodeURIComponent(skillName + " course introduction")}`,
        description: `Comprehensive course on ${skillName} from Udemy's top instructors.`,
        platform: 'Udemy'
      },
      {
        _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-course2`,
        title: `${skillName} Specialization`,
        type: 'video',
        url: `https://www.youtube.com/watch?v=videoseries?search_query=${encodeURIComponent(skillName + " tutorial for beginners")}`,
        description: `University-backed courses on ${skillName} with certificates upon completion.`,
        platform: 'Coursera'
      }
    ];
    
    // Check if the skill has specific course recommendations
    for (const [key, courses] of Object.entries(courseMap)) {
      if (skillName.toLowerCase().includes(key.toLowerCase())) {
        return courses.map((course, index) => ({
          _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-course${index + 1}`,
          title: course.title,
          type: 'video',
          url: course.url,
          description: `${course.platform} course on ${skillName}: ${course.description}`,
          platform: course.platform
        }));
      }
    }
    
    // Return default courses if no specific recommendations found
    return defaultCourses;
  };
  
  // Helper function to generate more comprehensive sample resources for a skill
  const generateSampleResources = (skillName) => {
    const resources = [];
    
    // Map skills to specific video tutorials 
    const videoTutorialMap = {
      'JavaScript': [
        { type: 'video', title: 'JavaScript Fundamentals', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', description: 'Learn JavaScript fundamentals in this comprehensive beginner tutorial.' },
        { type: 'video', title: 'Advanced JavaScript Concepts', url: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c', description: 'Dive into advanced JavaScript concepts like closures, prototypes, and async programming.' }
      ],
      'React': [
        { type: 'video', title: 'React Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', description: 'Learn React fundamentals by building a complete app from scratch.' },
        { type: 'video', title: 'React Hooks Masterclass', url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', description: 'Comprehensive tutorial on React Hooks and state management.' }
      ],
      'Node.js': [
        { type: 'video', title: 'Node.js Crash Course', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', description: 'Learn the fundamentals of Node.js and build a complete backend application.' },
        { type: 'video', title: 'RESTful API with Node.js', url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48', description: 'Build a complete RESTful API with Node.js, Express and MongoDB.' }
      ],
      'Python': [
        { type: 'video', title: 'Python Full Course for Beginners', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', description: 'Comprehensive Python tutorial covering all the fundamentals for beginners.' },
        { type: 'video', title: 'Python for Data Science', url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', description: 'Learn how to use Python for data analysis and data science applications.' }
      ],
      'HTML/CSS': [
        { type: 'video', title: 'HTML & CSS Full Course', url: 'https://www.youtube.com/watch?v=mU6anWqZJcc', description: 'Learn HTML and CSS from scratch - build a complete website.' },
        { type: 'video', title: 'CSS Flexbox & Grid Tutorial', url: 'https://www.youtube.com/watch?v=tXIhdp5R7sc', description: 'Master modern CSS layout techniques with flexbox and grid.' }
      ],
      'SQL': [
        { type: 'video', title: 'SQL Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', description: 'Complete SQL tutorial covering all essential database concepts.' },
        { type: 'video', title: 'Advanced SQL Techniques', url: 'https://www.youtube.com/watch?v=A0K2QYT8Rd0', description: 'Learn advanced SQL queries, functions and optimization techniques.' }
      ],
      'Data Structures': [
        { type: 'video', title: 'Data Structures Easy to Advanced Course', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', description: 'Complete data structures tutorial from basic to advanced concepts.' },
        { type: 'video', title: 'Data Structures for Coding Interviews', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', description: 'Master data structures commonly tested in coding interviews.' }
      ],
      'Machine Learning': [
        { type: 'video', title: 'Machine Learning for Beginners', url: 'https://www.youtube.com/watch?v=KNAWp2S3w94', description: 'Introduction to machine learning concepts and practical applications.' },
        { type: 'video', title: 'TensorFlow 2.0 Complete Course', url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', description: 'Build neural networks and deep learning models with TensorFlow 2.0' }
      ],
    };
    
    // Default video tutorials if skill is not in the map
    const defaultVideos = [
      {
        type: 'video',
        title: `${skillName} Fundamentals`,
        url: `https://www.youtube.com/watch?v=videoseries?search_query=${encodeURIComponent(`${skillName} tutorial for beginners`)}`,
        description: `Learn the fundamentals of ${skillName} with comprehensive video tutorials.`
      },
      {
        type: 'video',
        title: `Advanced ${skillName} Techniques`,
        url: `https://www.youtube.com/watch?v=videoseries?search_query=${encodeURIComponent(`advanced ${skillName} tutorial`)}`,
        description: `Take your ${skillName} skills to the next level with advanced concepts and techniques.`
      }
    ];
    
    // Get videos for this skill (from the map or defaults)
    let videos = defaultVideos;
    for (const [key, mappedVideos] of Object.entries(videoTutorialMap)) {
      if (skillName.toLowerCase().includes(key.toLowerCase())) {
        videos = mappedVideos;
        break;
      }
    }
    
    // Add video tutorials
    videos.forEach((video, index) => {
      resources.push({
        _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource${index + 1}`,
        title: video.title,
        type: 'video',
        url: video.url,
        description: video.description
      });
    });
    
    // Add documentation and articles
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource3`,
      title: `${skillName} Documentation`,
      type: 'article',
      url: `https://www.google.com/search?q=${encodeURIComponent(`${skillName} documentation official guide`)}`,
      description: `Official documentation and guides for learning ${skillName}.`
    });
    
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource4`,
      title: `${skillName} Best Practices`,
      type: 'article',
      url: `https://medium.com/search?q=${encodeURIComponent(`${skillName} best practices`)}`,
      description: `Learn industry best practices for ${skillName} from experienced professionals.`
    });
    
    // Add interview preparation resources
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource5`,
      title: `${skillName} Interview Questions`,
      type: 'article',
      url: `https://www.google.com/search?q=${encodeURIComponent(`${skillName} interview questions answers`)}`,
      description: `Common ${skillName} interview questions with detailed answers to help you prepare.`
    });
    
    // Add project-based learning resources with direct video links
    const projectVideos = {
      'JavaScript': 'https://www.youtube.com/watch?v=3PHXvlpOkf4',
      'Python': 'https://www.youtube.com/watch?v=8ext9G7xspg',
      'React': 'https://www.youtube.com/watch?v=F2JCjVSZlG0',
      'Node.js': 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
      'HTML/CSS': 'https://www.youtube.com/watch?v=oYRda7UtuhA',
      'Data Structures': 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    };
    
    let projectUrl = `https://www.youtube.com/watch?v=videoseries?search_query=${encodeURIComponent(`${skillName} project tutorial`)}`;
    for (const [key, url] of Object.entries(projectVideos)) {
      if (skillName.toLowerCase().includes(key.toLowerCase())) {
        projectUrl = url;
        break;
      }
    }
    
    resources.push({
      _id: `${skillName.replace(/[^a-zA-Z0-9]/g, '')}-resource6`,
      title: `${skillName} Projects for Practice`,
      type: 'video',
      url: projectUrl,
      description: `Build real-world projects using ${skillName} to enhance your portfolio and practical skills.`
    });
    
    // Add courses from top platforms
    const courses = generateCourseRecommendations(skillName);
    resources.push(...courses);
    
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

  // Navigate to company roadmap detail view
  const navigateToCompanyRoadmap = (companyId) => {
    setSelectedCompany(companyId);
    handleCompanySelect(companyId);
    
    // Scroll to the top of the page for better user experience
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // In a future enhancement, this could navigate to a dedicated page:
    // navigate(`/placement-material/company/${companyId}`);
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
                  <h4 className="skills-heading">Required Skills & Learning Resources</h4>
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
                <h2>{companies.find(c => c._id === selectedCompany).name}</h2>
                <p className="selected-company-profile">
                  {companies.find(c => c._id === selectedCompany).jobprofile || ''}
                </p>
                <p className="selected-company-description">
                  {companies.find(c => c._id === selectedCompany).description || ''}
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
                      <button 
                        className={`save-roadmap-btn ${isRoadmapSaved(roadmap._id) ? 'saved' : ''}`}
                        onClick={() => toggleSaveRoadmap(roadmap._id)}
                        title={isRoadmapSaved(roadmap._id) ? "Remove from saved roadmaps" : "Save to your profile"}
                      >
                        <i className={`fas ${isRoadmapSaved(roadmap._id) ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                      </button>
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
            
            {filteredCompanies.length > 0 ? (
              <div className="companies-grid">
                {filteredCompanies.map(company => (
                  <div key={company._id} className="company-card">
                    <h3 className="company-name">{company.name}</h3>
                    {company.jobprofile && (
                      <div className="company-profile">{company.jobprofile}</div>
                    )}
                    <p className="company-description">
                      {company.description || "Explore our curated roadmap to prepare for interviews at this company."}
                    </p>
                    
                    {company.rolesAndResponsibilities && company.rolesAndResponsibilities.length > 0 && (
                      <div className="company-roles-indicator">
                        <i className="fas fa-tasks"></i> {company.rolesAndResponsibilities.length} {company.rolesAndResponsibilities.length === 1 ? 'Role' : 'Roles'} Defined
                      </div>
                    )}
                    
                    <button 
                      className="company-details-btn"
                      onClick={() => navigateToCompanyRoadmap(company._id)}
                    >
                      <i className="fas fa-road"></i> View Roadmap
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>No companies match your search criteria</h3>
                <p>Try adjusting your search terms or browse our general resources instead.</p>
              </div>
            )}
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

  // Add dark mode toggle button to the PlacementMaterialPage component
  const renderDarkModeToggle = () => {
    return (
      <button 
        className="dark-mode-toggle" 
        onClick={toggleDarkMode} 
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? (
          <i className="fas fa-sun"></i>
        ) : (
          <i className="fas fa-moon"></i>
        )}
      </button>
    );
  };

  return (
    <div className="placement-material-page">
      <Navbar />
      <div className="placement-material-container">
        {renderDarkModeToggle()}
        
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