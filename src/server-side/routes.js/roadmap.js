import express from "express";
import { Roadmap, UserProgress } from "../models/Roadmap.js";
import { Company } from "../models/Company.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify user authentication
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "No Token" });
    }
    const decoded = jwt.verify(token, "karan-secret-key");
    next();
  } catch (err) {
    return res.json(err);
  }
};

// Get current user ID from token
const getCurrentUserId = (req) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, "karan-secret-key");
  return decoded._id;
};

// Generate roadmap based on company and job profile
router.post("/generate", verifyUser, async (req, res) => {
  try {
    const { companyId, jobProfile } = req.body;
    
    // Find the company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    // Check if roadmap already exists
    let roadmap = await Roadmap.findOne({ companyId, jobProfile });
    
    if (!roadmap) {
      // Create default resources for each skill
      const skillRoadmaps = [];
      
      // First, check if we have roles and responsibilities
      if (company.rolesAndResponsibilities && company.rolesAndResponsibilities.length > 0) {
        // Generate skills based on roles and responsibilities
        const roleBasedSkills = generateSkillsFromRoles(company.rolesAndResponsibilities);
        
        // Add role-based skills first
        for (const skill of roleBasedSkills) {
          const resources = generateRoleBasedResources(skill, company.rolesAndResponsibilities);
          
          skillRoadmaps.push({
            skillName: skill,
            resources: resources
          });
        }
      }
      
      // Then check for specifically required skills
      if (company.requiredSkills && company.requiredSkills.length > 0) {
        for (const skill of company.requiredSkills) {
          // Skip if we already added this skill from roles
          if (skillRoadmaps.some(s => s.skillName.toLowerCase() === skill.toLowerCase())) {
            continue;
          }
          
          // Generate default resources for each skill
          const resources = generateDefaultResources(skill);
          
          skillRoadmaps.push({
            skillName: skill,
            resources: resources
          });
        }
      } 
      
      // If no skills or roles specified, create default skills based on job profile
      if (skillRoadmaps.length === 0) {
        const defaultSkills = getDefaultSkillsForJobProfile(jobProfile);
        
        for (const skill of defaultSkills) {
          const resources = generateDefaultResources(skill);
          
          skillRoadmaps.push({
            skillName: skill,
            resources: resources
          });
        }
      }
      
      // Create new roadmap
      roadmap = new Roadmap({
        companyId,
        jobProfile,
        skills: skillRoadmaps
      });
      
      await roadmap.save();
    }
    
    return res.json({ roadmap });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all roadmaps
router.get("/all", verifyUser, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().populate('companyId', 'companyname jobprofile');
    return res.json({ roadmaps });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get roadmap by company ID
router.get("/company/:companyId", verifyUser, async (req, res) => {
  try {
    const { companyId } = req.params;
    const roadmaps = await Roadmap.find({ companyId }).populate('companyId', 'companyname jobprofile');
    return res.json({ roadmaps });
  } catch (error) {
    console.error("Error fetching roadmaps by company:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get specific roadmap
router.get("/:roadmapId", verifyUser, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findById(roadmapId).populate('companyId', 'companyname jobprofile');
    
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    
    // Get user progress if available
    const userId = getCurrentUserId(req);
    const userProgress = await UserProgress.findOne({ userId, roadmapId });
    
    return res.json({ roadmap, userProgress });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get progress for all saved roadmaps
router.get("/progress", verifyUser, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    
    // Find user to get saved roadmaps
    const user = await User.findById(userId);
    if (!user || !user.savedRoadmaps || user.savedRoadmaps.length === 0) {
      return res.json({ progress: [] });
    }
    
    // Get all progress entries for user's saved roadmaps
    const progressEntries = await UserProgress.find({
      userId,
      roadmapId: { $in: user.savedRoadmaps }
    });
    
    // Get total resources count for each roadmap
    const roadmaps = await Roadmap.find({
      _id: { $in: user.savedRoadmaps }
    });
    
    // Create a map of roadmap IDs to total resource counts
    const resourceCountMap = {};
    roadmaps.forEach(roadmap => {
      let totalResources = 0;
      roadmap.skills.forEach(skill => {
        totalResources += skill.resources.length;
      });
      resourceCountMap[roadmap._id.toString()] = totalResources;
    });
    
    // Map progress entries to include percentage completion
    const progressWithPercentage = user.savedRoadmaps.map(roadmapId => {
      // Find the progress entry for this roadmap
      const progressEntry = progressEntries.find(entry => 
        entry.roadmapId.toString() === roadmapId.toString()
      );
      
      // Get total resources for this roadmap
      const totalResources = resourceCountMap[roadmapId.toString()] || 0;
      
      // Return progress info with percentage
      return {
        roadmapId: roadmapId.toString(),
        completedResources: progressEntry ? progressEntry.completedResources : [],
        totalResources,
        percentage: totalResources > 0 && progressEntry
          ? Math.round((progressEntry.completedResources.length / totalResources) * 100)
          : 0
      };
    });
    
    return res.json({ progress: progressWithPercentage });
  } catch (error) {
    console.error("Error fetching roadmap progress:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Mark resource as completed/uncompleted
router.post("/progress/:roadmapId/:resourceId", verifyUser, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { roadmapId, resourceId } = req.params;
    const { completed } = req.body;
    
    // Find or create progress entry
    let progressEntry = await UserProgress.findOne({ userId, roadmapId });
    
    if (!progressEntry) {
      progressEntry = new UserProgress({
        userId,
        roadmapId,
        completedResources: []
      });
    }
    
    if (completed) {
      // Add resource to completed list if not already there
      if (!progressEntry.completedResources.includes(resourceId)) {
        progressEntry.completedResources.push(resourceId);
      }
    } else {
      // Remove resource from completed list
      progressEntry.completedResources = progressEntry.completedResources
        .filter(id => id.toString() !== resourceId);
    }
    
    progressEntry.lastUpdated = new Date();
    await progressEntry.save();
    
    return res.json({ 
      message: completed ? "Resource marked as completed" : "Resource marked as incomplete",
      completedResources: progressEntry.completedResources
    });
  } catch (error) {
    console.error("Error updating resource progress:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Save roadmap to user profile
router.post("/save/:roadmapId", verifyUser, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = getCurrentUserId(req);
    
    // Verify roadmap exists
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    
    // Find user and update saved roadmaps
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if roadmap is already saved
    const isAlreadySaved = user.savedRoadmaps && user.savedRoadmaps.some(id => id.toString() === roadmapId);
    
    if (isAlreadySaved) {
      // If already saved, remove it (toggle functionality)
      user.savedRoadmaps = user.savedRoadmaps.filter(id => id.toString() !== roadmapId);
      await user.save();
      return res.json({ 
        message: "Roadmap removed from saved list", 
        isSaved: false,
        savedRoadmaps: user.savedRoadmaps
      });
    } else {
      // Otherwise, add it to saved roadmaps
      if (!user.savedRoadmaps) {
        user.savedRoadmaps = [];
      }
      user.savedRoadmaps.push(roadmapId);
      await user.save();
      return res.json({ 
        message: "Roadmap saved successfully", 
        isSaved: true,
        savedRoadmaps: user.savedRoadmaps
      });
    }
  } catch (error) {
    console.error("Error saving roadmap:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all saved roadmaps for current user
router.get("/saved", verifyUser, async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    
    // Find user and populate saved roadmaps
    const user = await User.findById(userId).populate({
      path: 'savedRoadmaps',
      populate: {
        path: 'companyId',
        select: 'name jobprofile'
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ 
      savedRoadmaps: user.savedRoadmaps || [] 
    });
  } catch (error) {
    console.error("Error fetching saved roadmaps:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Helper function to generate default resources for a skill
function generateDefaultResources(skill) {
  const resources = [];
  
  // Default video resources
  resources.push({
    title: `Learn ${skill} - Beginner Tutorial`,
    type: 'video',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`learn ${skill} tutorial`)}`,
    description: `A comprehensive beginner tutorial on ${skill}.`
  });
  
  resources.push({
    title: `${skill} Advanced Concepts`,
    type: 'video',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} advanced concepts`)}`,
    description: `Advanced concepts and techniques in ${skill}.`
  });
  
  // Default article resources
  resources.push({
    title: `${skill} Documentation`,
    type: 'article',
    url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} documentation`)}`,
    description: `Official documentation and guides for ${skill}.`
  });
  
  resources.push({
    title: `${skill} Best Practices`,
    type: 'article',
    url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} best practices`)}`,
    description: `Industry best practices for ${skill}.`
  });
  
  return resources;
}

// Helper function to get default skills based on job profile
function getDefaultSkillsForJobProfile(jobProfile) {
  const jobProfileLower = jobProfile.toLowerCase();
  
  if (jobProfileLower.includes('frontend') || jobProfileLower.includes('front-end')) {
    return ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue.js'];
  } else if (jobProfileLower.includes('backend') || jobProfileLower.includes('back-end')) {
    return ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'API Design', 'Authentication'];
  } else if (jobProfileLower.includes('fullstack') || jobProfileLower.includes('full-stack')) {
    return ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js'];
  } else if (jobProfileLower.includes('data')) {
    return ['Python', 'SQL', 'Data Analysis', 'Machine Learning', 'Data Visualization'];
  } else if (jobProfileLower.includes('devops')) {
    return ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform'];
  } else if (jobProfileLower.includes('mobile')) {
    return ['React Native', 'Flutter', 'iOS Development', 'Android Development'];
  } else {
    // Default skills for general software development
    return ['JavaScript', 'Python', 'Java', 'Data Structures', 'Algorithms', 'System Design'];
  }
}

// Helper function to generate skills from roles and responsibilities
function generateSkillsFromRoles(roles) {
  const skillMap = {
    'frontend': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'UI/UX Design'],
    'backend': ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'API Design', 'Authentication'],
    'fullstack': ['React', 'Node.js', 'MongoDB', 'Express.js', 'API Integration', 'Full Project Architecture'],
    'data': ['Python', 'SQL', 'Data Analysis', 'Machine Learning', 'Data Visualization'],
    'devops': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform'],
    'mobile': ['React Native', 'Flutter', 'iOS Development', 'Android Development'],
    'infrastructure': ['Cloud Architecture', 'AWS', 'Azure', 'GCP', 'DevOps'],
    'security': ['Penetration Testing', 'Security Protocols', 'Encryption', 'Authentication'],
    'testing': ['Unit Testing', 'Integration Testing', 'Test Automation', 'QA Processes'],
    'database': ['SQL', 'NoSQL', 'Database Design', 'Optimization', 'Data Modeling'],
    'api': ['REST API', 'GraphQL', 'API Authentication', 'API Design', 'Documentation'],
    'microservices': ['Service Architecture', 'Docker', 'Kubernetes', 'API Gateways'],
    'ui': ['CSS', 'Design Systems', 'Responsive Design', 'Accessibility'],
    'design': ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research'],
    'project': ['Agile Methodologies', 'Scrum', 'Project Management', 'JIRA']
  };
  
  // Extract keywords from roles and match to skills
  const detectedSkills = new Set();
  
  roles.forEach(role => {
    const roleLower = role.toLowerCase();
    
    Object.keys(skillMap).forEach(keyword => {
      if (roleLower.includes(keyword)) {
        skillMap[keyword].forEach(skill => detectedSkills.add(skill));
      }
    });
    
    // Also check for specific technologies mentioned directly in roles
    const techKeywords = [
      'React', 'Angular', 'Vue', 'Node', 'Express', 'MongoDB', 'SQL', 
      'Python', 'Java', 'JavaScript', 'TypeScript', 'C#', '.NET',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
      'REST', 'GraphQL', 'API', 'Microservices', 'Serverless'
    ];
    
    techKeywords.forEach(tech => {
      if (roleLower.includes(tech.toLowerCase())) {
        detectedSkills.add(tech);
      }
    });
  });
  
  return Array.from(detectedSkills);
}

// Helper function to generate role-specific resources
function generateRoleBasedResources(skill, roles) {
  const resources = [];
  
  // Basic resources similar to default resources
  resources.push({
    title: `Learn ${skill} - Focused Tutorial`,
    type: 'video',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`learn ${skill} tutorial for job`)}`,
    description: `A targeted tutorial on ${skill} for job preparation.`
  });
  
  // Create more context-aware resources based on the roles
  const roleContext = roles.join(' ');
  
  // Interview preparation resource
  resources.push({
    title: `${skill} Interview Questions & Answers`,
    type: 'article',
    url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} interview questions answers`)}`,
    description: `Common interview questions about ${skill} and how to answer them effectively.`
  });
  
  // Project-based learning
  resources.push({
    title: `Build a ${skill} Project`,
    type: 'video',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} project tutorial real world`)}`,
    description: `Learn ${skill} by building a real-world project that demonstrates your abilities.`
  });
  
  // Add role-specific resource if we can identify a context
  if (roleContext.toLowerCase().includes('frontend') && skill.match(/html|css|javascript|react|angular|vue/i)) {
    resources.push({
      title: `${skill} for Frontend Development`,
      type: 'article',
      url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} frontend development best practices`)}`,
      description: `How to use ${skill} effectively in frontend development roles.`
    });
  } 
  else if (roleContext.toLowerCase().includes('backend') && skill.match(/node|express|sql|mongodb|api|authentication/i)) {
    resources.push({
      title: `${skill} for Backend Architecture`,
      type: 'article',
      url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} backend architecture best practices`)}`,
      description: `How to implement ${skill} in backend systems effectively.`
    });
  }
  
  // Documentation
  resources.push({
    title: `${skill} Documentation`,
    type: 'article',
    url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} documentation`)}`,
    description: `Official documentation and guides for ${skill}.`
  });
  
  return resources;
}

export { router as RoadmapRouter };