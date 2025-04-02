import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * Enhanced User Schema with encrypted sensitive fields
 * This schema is designed to store sensitive user information in an encrypted format
 */
const encryptedUserSchema = new mongoose.Schema({
  // Basic user info - not encrypted
  name: {
    type: String,
    required: true
  },
  
  // Username/email - public identifier
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Password hash - secured with bcrypt
  password: {
    type: String,
    required: true
  },
  
  // Role for permissions
  role: {
    type: String,
    enum: ['ADMIN', 'STAFF', 'STUDENT', 'RECRUITER', 'GUEST'],
    default: 'STUDENT',
    required: true,
    index: true
  },
  
  // Admin flag (legacy compatibility)
  isAdmin: {
    type: String,
    default: "0"
  },
  
  // Profile status 
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  
  // Profile visibility
  visibility: {
    type: String,
    enum: ['PUBLIC', 'RECRUITERS_ONLY', 'PRIVATE'],
    default: 'RECRUITERS_ONLY'
  },
  
  // Sensitive contact information - encrypted
  contactNumber: {
    encryptedData: { type: String },
    iv: { type: String },
    authTag: { type: String }
  },
  
  // SAP/Student ID - encrypted
  sapId: {
    encryptedData: { type: String },
    iv: { type: String },
    authTag: { type: String }
  },
  
  // Roll Number - encrypted if present
  rollNo: {
    encryptedData: { type: String },
    iv: { type: String },
    authTag: { type: String }
  },
  
  // Personal information - encrypted
  gender: {
    encryptedData: { type: String },
    iv: { type: String },
    authTag: { type: String }
  },
  
  dob: {
    encryptedData: { type: String },
    iv: { type: String },
    authTag: { type: String }
  },
  
  // Address - encrypted
  address: {
    street: {
      encryptedData: { type: String },
      iv: { type: String },
      authTag: { type: String }
    },
    city: {
      encryptedData: { type: String },
      iv: { type: String },
      authTag: { type: String }
    },
    state: {
      encryptedData: { type: String },
      iv: { type: String },
      authTag: { type: String }
    },
    postalCode: {
      encryptedData: { type: String },
      iv: { type: String },
      authTag: { type: String }
    },
    country: {
      encryptedData: { type: String },
      iv: { type: String },
      authTag: { type: String }
    }
  },
  
  // Academic Information - could be encrypted if considered sensitive
  // Generally less sensitive than personal identifiers
  stream: {
    type: String
  },
  
  tenthPercentage: {
    type: Number
  },
  
  tenthSchool: {
    type: String
  },
  
  twelfthPercentage: {
    type: Number
  },
  
  twelfthCollege: {
    type: String
  },
  
  graduationCGPA: {
    type: Number
  },
  
  sixthSemesterCGPA: {
    type: Number
  },
  
  // Resume - reference to Document model
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  // Certificates - references to Document model
  certificateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Account security settings
  security: {
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      timestamp: Date,
      ipAddress: String,
      userAgent: String
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    accountLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    }
  },
  
  // Consent tracking for GDPR compliance
  consents: [{
    type: {
      type: String,
      enum: ['PROFILE_SHARING', 'EMAIL_MARKETING', 'DATA_PROCESSING'],
      required: true
    },
    granted: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  
  // Activity tracking
  lastActive: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, { timestamps: true });

// Password hashing middleware
encryptedUserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
encryptedUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const EncryptedUser = mongoose.model('EncryptedUser', encryptedUserSchema);

export { EncryptedUser }; 