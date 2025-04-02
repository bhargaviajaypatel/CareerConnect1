import mongoose from 'mongoose';

/**
 * Document Schema
 * Stores metadata about uploaded documents with encrypted fields
 */
const documentSchema = new mongoose.Schema({
  // User who owns this document
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Document type (resume, certificate, etc.)
  documentType: {
    type: String,
    required: true,
    enum: ['RESUME', 'CERTIFICATE', 'TRANSCRIPT', 'ID_PROOF', 'OTHER'],
    index: true
  },
  
  // Display name (visible to user)
  displayName: {
    type: String,
    required: true
  },
  
  // MIME type for content validation
  mimetype: {
    type: String,
    required: true
  },
  
  // File size in bytes
  size: {
    type: Number,
    required: true
  },
  
  // Encrypted original filename
  // Stored as an object with encryptedData, iv, and authTag fields
  originalName: {
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true }
  },
  
  // Encrypted storage key/path
  // Stored as an object with encryptedData, iv, and authTag fields
  storageKey: {
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true }
  },
  
  // Document status
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'],
    default: 'PENDING',
    index: true
  },
  
  // Visibility level
  visibility: {
    type: String,
    required: true,
    enum: ['PRIVATE', 'RECRUITERS', 'PUBLIC'],
    default: 'PRIVATE'
  },
  
  // Optional description
  description: {
    type: String
  },
  
  // Optional tags for categorization
  tags: [{
    type: String
  }],
  
  // Approval info
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  // Rejection reason if rejected
  rejectionReason: {
    type: String
  },
  
  // Scan result if scanned for malware
  scanResult: {
    isSafe: { type: Boolean },
    skipped: { type: Boolean },
    message: { type: String },
    scannedAt: { type: Date }
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

// Indexes for efficient querying
documentSchema.index({ userId: 1, documentType: 1 });
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ documentType: 1, status: 1, visibility: 1 });

/**
 * Create the Document model
 */
const Document = mongoose.model('Document', documentSchema);

export { Document }; 