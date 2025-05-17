import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    bio: String,
    department: String,
    graduationYear: Number,
    skills: [String],
    resume: String
  },
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String
  },
  preferences: {
    jobAlerts: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  contactNumber: { type: String, required: true },
  sapId: { type: String, required: true },
  rollNo: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  tenthPercentage: { type: Number, required: true },
  tenthSchool: { type: String, required: true },
  twelfthPercentage: { type: Number, required: true },
  twelfthCollege: { type: String, required: true },
  graduationCollege: { type: String },
  graduationCGPA: { type: Number },
  stream: { type: String, required: true },
  sixthSemesterCGPA: { type: Number },
  placementStatus: { type: String, default: "Not Placed" },
  companyPlaced: { type: String, default: null },
  package: { type: Number, default: null },
  position: { type: String, default: null },
  location: { type: String, default: null },
  appliedCompanies: [
    { type: mongoose.Schema.Types.ObjectId, ref: "companies" },
  ],
  scheduledInterviews: [{
    companyName: { type: String, required: true },
    interviewDate: { type: Date, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }
  }],
  resume: {
    filename: { type: String },
    path: { type: String }
  },
  // Profile picture field
  profilePicture: {
    filename: { type: String },
    contentType: { type: String },
    data: { type: Buffer }
  },
  skills: { type: String, default: "" },
  projects: { type: String, default: "" },
  internships: { type: String, default: "" },
  achievements: { type: String, default: "" },
  certifications: { type: String, default: "" },
  
  // Add saved roadmaps array containing references to Roadmap model
  savedRoadmaps: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap" }
  ],
  
  // Add career preferences
  careerPreferences: {
    interestedCompanies: [{ type: String }],
    interestedRoles: [{ type: String }],
    interestedSkills: [{ type: String }],
    careerGoals: { type: String, default: "" }
  },
  
  // Add social media links
  socialMedia: {
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    twitter: { type: String, default: "" },
    website: { type: String, default: "" }
  },
  
  // Add hobbies as an array of strings
  hobbies: [{ type: String }],
  
  // Add documents array for file management
  documents: [{
    documentType: { type: String, default: "OTHER" },
    filename: { type: String },
    path: { type: String },
    description: { type: String, default: "" },
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Add a last updated timestamp
  lastUpdated: { type: Date, default: Date.now },
  
  // Add a profile completion percentage (calculated field)
  profileCompletion: { type: Number, default: 0 },
  
  // Reset code for password reset functionality
  resetCode: { type: String }
  
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamps before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const UserModel = mongoose.model("User", userSchema);
export { UserModel as User };
