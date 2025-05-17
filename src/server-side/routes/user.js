import express from "express";
import { User } from "../models/user.js";
import { Company } from "../models/Company.js";
import { Interview } from "../models/Experience.js";
import multer from "multer";
const router = express.Router();

//---------------------------------------------USER ENDPOINTS--------------------------------------------------//

// Configure multer for file uploads without restrictions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage
});

//User Registration API - removed security validations
router.post("/register", upload.single('resume'), async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({ message: "User already existed" });
    }

    // Extract data from request body without validation
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // No password hashing
      contactNumber: req.body.contactNumber,
      sapId: req.body.sapId,
      rollNo: req.body.rollNo,
      gender: req.body.gender,
      dob: req.body.dob,
      tenthPercentage: req.body.tenthPercentage === "null" ? null : parseFloat(req.body.tenthPercentage),
      tenthSchool: req.body.tenthSchool,
      twelfthPercentage: req.body.twelfthPercentage === "null" ? null : parseFloat(req.body.twelfthPercentage),
      twelfthCollege: req.body.twelfthCollege,
      graduationCollege: req.body.graduationCollege,
      graduationCGPA: req.body.graduationCGPA === "null" ? null : parseFloat(req.body.graduationCGPA),
      stream: req.body.stream,
      sixthSemesterCGPA: req.body.sixthSemesterCGPA === "null" ? null : parseFloat(req.body.sixthSemesterCGPA),
      isAdmin: req.body.isAdmin === 'true' || req.body.isAdmin === true ? true : false,
      skills: req.body.skills || "",
      projects: req.body.projects || "",
      internships: req.body.internships || "",
      achievements: req.body.achievements || "",
      certifications: req.body.certifications || "",
      
      // Add career preferences
      careerPreferences: {
        interestedCompanies: req.body.interestedCompanies ? req.body.interestedCompanies.split(',').map(item => item.trim()) : [],
        interestedRoles: req.body.interestedRoles ? req.body.interestedRoles.split(',').map(item => item.trim()) : [],
        interestedSkills: req.body.interestedSkills ? req.body.interestedSkills.split(',').map(item => item.trim()) : [],
        careerGoals: req.body.careerGoals || ""
      }
    };

    // Add resume if provided - no security checks
    if (req.file) {
      userData.resume = {
        filename: req.file.originalname,
        path: req.file.path
      };
    }

    // Create and save new user
    const newUser = new User(userData);
    await newUser.save();
    
    return res.json({ message: "User Registered" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Auth endpoint for login using MongoDB - handle both root path and /login path
router.post(["/", "/login"], async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Auth endpoint called with email:", email);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Try to find user in database first
    let user = await User.findOne({ email });
    
    // If user not found in database, try hardcoded users as fallback
    if (!user) {
      console.log("User not found in database");
      return res.json("Invalid User");
    }
    
    // Use the comparePassword method from the User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for:", email);
      return res.json("Invalid User");
    }
    
    console.log("Login successful for database user:", email, "isAdmin:", user.role === 'admin');
    
    // Return role-based response
    return res.json(user.role === 'admin' ? "Admin" : "Success");
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Verification endpoint to check if user is authenticated
router.get("/verify", async (req, res) => {
  try {
    // Get email from query params or headers
    const email = req.query.email || req.headers['user-email'];
    
    if (!email) {
      console.log("No email provided for verification");
      return res.json("Invalid");
    }
    
    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.json("Invalid");
    }
    
    console.log(`User verified: ${email} role: ${user.role}`);
    return res.json(user.role === 'admin' ? "Admin" : "Success");
  } catch (error) {
    console.error("Verification error:", error);
    return res.json("Invalid");
  }
});

// Route to fetch the current user's details - flexible with both userId and email
router.get("/currentUser", async (req, res) => {
  try {
    // Get userId or email from query parameter
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.status(400).json({ message: "UserId or email is required" });
    }

    let user;
    
    // Try to find by ID first if provided
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      // Otherwise find by email
      user = await User.findOne({ email });
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all users - no access control
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({});
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update user - no verification
router.put("/:id", upload.single('resume'), async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = { ...req.body };
    
    if (req.file) {
      userData.resume = {
        filename: req.file.originalname,
        path: req.file.path
      };
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Update failed", error: error.message });
  }
});

// Delete user - no authorization check
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Deletion failed", error: error.message });
  }
});

// Handle forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a password reset code (simple for demo purposes)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the reset code to the user record (would normally expire after a time)
    user.resetCode = resetCode;
    await user.save();

    // Simulate sending an email (would connect to a real email service in production)
    console.log(`Reset code for ${email}: ${resetCode}`);

    return res.json({ 
      message: "Password reset code generated", 
      note: "In a real application, an email would be sent. Check the server console for the code." 
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Reset password with code
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    const user = await User.findOne({ email, resetCode });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid email or reset code" });
    }
    
    // Update password - no hashing
    user.password = newPassword;
    user.resetCode = undefined; // Clear the reset code
    await user.save();
    
    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//API to add a company ID to appliedCompanies array for a user
router.post("/applyCompany/:userId/:companyId", async (req, res) => {
  const { userId, companyId } = req.params;
  console.log("User ID: ", userId);
  console.log("Company ID:", companyId);

  try {
    // Validate userId format before querying the database
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    console.log("User:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.appliedCompanies) {
      user.appliedCompanies = [];
    }

    if (user.appliedCompanies.includes(companyId)) {
      return res
        .status(400)
        .json({ message: "User already applied to this company" });
    }

    user.appliedCompanies.push(companyId);
    await user.save();

    return res.json({ message: "Company applied successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Original endpoint to retrieve scheduled interviews for a user
router.get("/scheduledInterviews/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId format before querying the database
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has scheduledInterviews field
    if (!user.scheduledInterviews || !Array.isArray(user.scheduledInterviews)) {
      return res.json({ scheduledInterviews: [] });
    }

    // Return the scheduled interviews directly from the user document
    return res.json({ scheduledInterviews: user.scheduledInterviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//API to post interview experience
router.post("/add-interview", async (req, res) => {
  try {
    const {
      username,
      companyName,
      position,
      experience,
      interviewLevel,
      result,
    } = req.body;

    const newInterview = new Interview({
      username,
      companyName,
      position,
      experience,
      interviewLevel,
      result,
    });

    await newInterview.save();

    return res.json({ message: "Interview experience added successfully" });
  } catch (error) {
    console.error("Error adding interview experience:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//API to fetch the interview experiences on the feed
router.get("/fetchinterviewexperience", async (req, res) => {
  try {
    const interviews = await Interview.find({});
    return res.json({ data: interviews });
  } catch (error) {
    console.error("Error fetching interview experiences:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/placementStatus/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format before querying the database
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get the placement status
    const status = user.placementStatus;

    // Return all placement-related information
    const placementInfo = {
      status,
      companyName: user.companyPlaced || null,
      package: user.package || null,
      position: user.position || null,
      location: user.location || null
    };

    return res.json(placementInfo);
  } catch (error) {
    console.error('Error fetching placement status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//---------------------------------------------ADMIN ENDPOINTS--------------------------------------------------//

// This API endpoint is responsible for adding new company details to the database.
router.post("/add-companies", async (req, res) => {
  const {
    companyname,
    jobprofile,
    jobdescription,
    website,
    ctc,
    doi,
    eligibilityCriteria,
    tenthPercentage,
    twelfthPercentage,
    graduationCGPA,
    sixthSemesterCGPA,
    requiredSkills,
    rolesAndResponsibilities,
  } = req.body;

  try {
    const newCompany = new Company({
      companyname,
      jobprofile,
      jobdescription,
      website,
      ctc,
      doi,
      eligibilityCriteria,
      tenthPercentage,
      twelfthPercentage,
      graduationCGPA,
      sixthSemesterCGPA,
      requiredSkills,
      rolesAndResponsibilities,
    });

    await newCompany.save();
    console.log(newCompany);
    return res.json({ message: "Company Registered" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to fetch all users and generate user reports.
// It retrieves all users from the database and sends them as a response.
router.get("/getUsers", async (req, res) => {
  try {
    const allUsers = await User.find({});

    res.send({ data: allUsers });
  } catch (error) {
    console.log(error);
  }
});

// Route to fetch all companies.
// It retrieves all companies from the database and sends them as a response.
router.get("/getCompanies", async (req, res) => {
  try {
    const allCompanies = await Company.find({});

    res.send({ data: allCompanies });
  } catch (error) {
    console.log(error);
  }
});

// Route to update company data.
// It updates the company details based on the provided ID.
router.put("/updatecompany/:id", (req, res) => {
  const id = req.params.id;
  Company.findByIdAndUpdate(id, {
    companyname: req.body.companyname,
    jobprofile: req.body.jobprofile,
    jobdescription: req.body.jobdescription,
    website: req.body.website,
    ctc: req.body.ctc,
    doi: req.body.doi,
    eligibilityCriteria: req.body.eligibilityCriteria,
    tenthPercentage: req.body.tenthPercentage,
    twelfthPercentage: req.body.twelfthPercentage,
    graduationCGPA: req.body.graduationCGPA,
    sixthSemesterCGPA: req.body.sixthSemesterCGPA,
    requiredSkills: req.body.requiredSkills,
    rolesAndResponsibilities: req.body.rolesAndResponsibilities,
  })
    .then((company) => res.json(company))
    .catch((err) => res.json(err));
});

// Route to delete company data.
// It deletes the company based on the provided ID.
router.delete("/deletecompany/:id", (req, res) => {
  const id = req.params.id;
  Company.findByIdAndDelete({ _id: id })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

// Route to fetch a specific company by ID.
// It retrieves the company details based on the provided ID.
router.get("/getCompanies/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.findById(id);

    res.send({ data: company });
  } catch (error) {
    console.log(error);
  }
});

//This API fetches the users and the companies they have applied to
router.get("/companyApplicants", async (req, res) => {
  console.log("companyApplicants endpoint called");
  try {
    const companies = await Company.find(); // Assuming you have a Company model
    console.log(`Found ${companies.length} companies`);

    const companyData = [];

    for (const company of companies) {
      console.log(`Processing company: ${company.companyname} (${company._id})`);
      const applicants = await User.find({ appliedCompanies: company._id });
      console.log(`Found ${applicants.length} applicants for company ${company.companyname}`);

      const companyInfo = {
        companyId: company._id,
        companyName: company.companyname,
        applicants: applicants.map((applicant) => ({
          userId: applicant._id,
          name: applicant.name,
          email: applicant.email,
        })),
      };

      companyData.push(companyInfo);
    }

    console.log(`Returning data for ${companyData.length} companies`);
    res.json(companyData);
  } catch (error) {
    console.error("Error fetching company applicants:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Backend API to update placementStatus
router.post("/updatePlacementStatus", async (req, res) => {
  try {
    const { userId, companyId, status, package: salaryPackage, position, location } = req.body;
    
    // Validate userId format before querying the database
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.placementStatus === "Placed" && status === "Placed") {
      return res.status(200).json({ message: "User is already placed." });
    }
    const company = await Company.findById(companyId);
    console.log(company.companyname);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    user.placementStatus = status;
    user.companyPlaced = company.companyname;
    
    // Update additional placement details if provided
    if (salaryPackage) user.package = salaryPackage;
    if (position) user.position = position;
    if (location) user.location = location;
    
    // If no specific salary package is provided but company has CTC, use that
    if (!salaryPackage && company.ctc) {
      user.package = company.ctc;
    }
    
    await user.save();
    res.json({
      message: `Placement status updated to ${status} successfully.`,
    });
  } catch (error) {
    console.error("Error updating placement status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Profile endpoint to get user profile data
router.get("/profile", async (req, res) => {
  try {
    const profileUserId = req.query.userId;
    
    if (!profileUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findById(profileUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return complete user data without the password
    const userData = user.toObject();
    delete userData.password;
    delete userData.resetCode;
    
    return res.json({ user: userData });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update profile endpoint - allows updating individual fields
router.post("/updateProfile", async (req, res) => {
  try {
    const profileUserId = req.query.userId;
    
    if (!profileUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    const { field, value } = req.body;
    
    if (!field || value === undefined) {
      return res.status(400).json({ message: "Field and value are required" });
    }
    
    const updateData = {};
    updateData[field] = value;
    
    const user = await User.findByIdAndUpdate(
      profileUserId,
      { $set: updateData },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Upload profile picture endpoint
router.post("/uploadProfilePicture", upload.single('profilePicture'), async (req, res) => {
  try {
    const profileUserId = req.query.userId;
    
    if (!profileUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }
    
    // Save profile picture to user record
    const user = await User.findByIdAndUpdate(
      profileUserId,
      {
        profilePicture: {
          filename: req.file.originalname,
          path: req.file.path
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ message: "Profile picture uploaded successfully" });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get profile picture endpoint
router.get("/profilePicture/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate userId format before querying the database
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    
    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({ message: "Profile picture not found" });
    }
    
    res.set('Content-Type', user.profilePicture.contentType);
    return res.send(user.profilePicture.data);
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Generate resume PDF endpoint
router.get("/generateResume", async (req, res) => {
  try {
    const profileUserId = req.query.userId;
    
    if (!profileUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findById(profileUserId)
      .populate('savedRoadmaps');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // In a real implementation, this would generate a PDF
    // For now, just return user data
    return res.json({ message: "Resume data", user });
  } catch (error) {
    console.error("Error generating resume:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Upload document endpoint
router.post("/documents/upload", upload.single('document'), async (req, res) => {
  try {
    const docUserId = req.query.userId;
    
    if (!docUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No document uploaded" });
    }
    
    const { documentType, description } = req.body;
    
    const user = await User.findById(docUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create document record
    const document = {
      documentType: documentType || "OTHER",
      filename: req.file.originalname,
      path: req.file.path,
      description: description || "",
      uploadDate: new Date()
    };
    
    // Add document to user's documents array
    if (!user.documents) {
      user.documents = [];
    }
    
    user.documents.push(document);
    await user.save();
    
    return res.json({ message: "Document uploaded successfully", document });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get all documents for the current user
router.get("/documents", async (req, res) => {
  try {
    const docUserId = req.query.userId;
    
    if (!docUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findById(docUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return all documents
    return res.json({ documents: user.documents || [] });
  } catch (error) {
    console.error("Error getting documents:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get a specific document by ID
router.get("/documents/:documentId", async (req, res) => {
  try {
    const docUserId = req.query.userId;
    const { documentId } = req.params;
    
    if (!docUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findById(docUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the document in the user's documents array
    const document = user.documents.find(doc => doc._id.toString() === documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Return document data
    return res.json({ document });
  } catch (error) {
    console.error("Error getting document:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a document
router.delete("/documents/:documentId", async (req, res) => {
  try {
    const docUserId = req.query.userId;
    const { documentId } = req.params;
    
    if (!docUserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findById(docUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the document index
    const documentIndex = user.documents.findIndex(doc => doc._id.toString() === documentId);
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Remove the document from the array
    user.documents.splice(documentIndex, 1);
    await user.save();
    
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update hobbies endpoint
router.post("/hobbies", async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    const { hobbies } = req.body;
    
    if (!Array.isArray(hobbies)) {
      return res.status(400).json({ message: "Hobbies must be an array" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.hobbies = hobbies;
    user.lastUpdated = new Date();
    
    await user.save();
    
    return res.json({ 
      success: true, 
      message: "Hobbies updated successfully",
      hobbies: user.hobbies
    });
  } catch (error) {
    console.error("Error updating hobbies:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update social media links
router.post("/socialMedia", async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    const { socialMedia } = req.body;
    
    if (typeof socialMedia !== 'object') {
      return res.status(400).json({ message: "Social media must be an object" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Initialize socialMedia if it doesn't exist
    if (!user.socialMedia) {
      user.socialMedia = {};
    }
    
    // Update only the provided fields
    if (socialMedia.linkedin !== undefined) user.socialMedia.linkedin = socialMedia.linkedin;
    if (socialMedia.github !== undefined) user.socialMedia.github = socialMedia.github;
    if (socialMedia.twitter !== undefined) user.socialMedia.twitter = socialMedia.twitter;
    if (socialMedia.website !== undefined) user.socialMedia.website = socialMedia.website;
    
    user.lastUpdated = new Date();
    
    await user.save();
    
    return res.json({ 
      success: true, 
      message: "Social media links updated successfully",
      socialMedia: user.socialMedia
    });
  } catch (error) {
    console.error("Error updating social media links:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get user by email
router.get("/getUserByEmail", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Try to find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber || '',
      stream: user.stream || '',
      gender: user.gender || '',
      rollNo: user.rollNo || '',
      sapId: user.sapId || '',
      isAdmin: user.isAdmin || false,
      tenthPercentage: user.tenthPercentage || '',
      twelfthPercentage: user.twelfthPercentage || '',
      graduationCGPA: user.graduationCGPA || '',
      sixthSemesterCGPA: user.sixthSemesterCGPA || '',
      careerPreferences: user.careerPreferences || {}
    };
    
    return res.json(userData);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Alias for currentUser with auth path
router.get("/auth/currentUser", async (req, res) => {
  try {
    // Get userId or email from query parameter
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.status(400).json({ message: "UserId or email is required" });
    }

    let user;
    
    // Try to find by ID first if provided
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      // Otherwise find by email
      user = await User.findOne({ email });
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to retrieve scheduled interviews with auth prefix for frontend compatibility
router.get("/auth/scheduledInterviews/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId format before querying the database
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has scheduledInterviews field
    if (!user.scheduledInterviews || !Array.isArray(user.scheduledInterviews)) {
      return res.json({ scheduledInterviews: [] });
    }

    // Return the scheduled interviews directly from the user document
    return res.json({ scheduledInterviews: user.scheduledInterviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export { router as UserRouter };
