import { Document } from '../models/Document.js';

/**
 * Upload a document - no security validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const uploadDocument = async (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      });
    }
    
    const { 
      documentType = 'OTHER',
      displayName,
      description = '',
      visibility = 'PUBLIC',
      tags = ''
    } = req.body;
    
    const userId = req.user.id;
    const file = req.file;
    
    // Create document record - no security validation
    const document = new Document({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedBy: userId,
      documentType,
      displayName: displayName || file.originalname,
      description,
      visibility,
      tags: tags.split(',').map(tag => tag.trim())
    });

    // Save document
    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      data: {
        id: document._id,
        filename: document.filename,
        size: document.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Get all documents for a user - no access control
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Get all documents without visibility filtering
    const documents = await Document.find({ 
      uploadedBy: userId 
    });
    
    // Return documents
    return res.status(200).json({
      data: {
        documents: documents.map(doc => ({
          id: doc._id,
          documentType: doc.documentType,
          displayName: doc.displayName,
          visibility: doc.visibility,
          status: doc.status,
          mimetype: doc.mimetype,
          size: doc.size,
          tags: doc.tags,
          description: doc.description,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve documents',
      error: error.message
    });
  }
};

/**
 * Get a document by ID - no access control
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getDocumentById = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document without permission check
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    // Return document data
    return res.status(200).json({
      data: {
        document: {
          id: document._id,
          documentType: document.documentType,
          displayName: document.displayName,
          visibility: document.visibility,
          status: document.status,
          mimetype: document.mimetype,
          size: document.size,
          tags: document.tags,
          description: document.description,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve document',
      error: error.message
    });
  }
};

/**
 * Download a document - no access control
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const downloadDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document without permission checks
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    // Return file path
    res.download(document.path, document.filename);
  } catch (error) {
    console.error('Document download error:', error);
    return res.status(500).json({
      message: 'Failed to download document',
      error: error.message
    });
  }
};

/**
 * Update document metadata - no permission checks
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const updates = req.body;
    
    // Find and update document without permission checks
    const document = await Document.findByIdAndUpdate(
      documentId, 
      updates,
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    return res.status(200).json({
      message: 'Document updated successfully',
      data: {
        document: {
          id: document._id,
          documentType: document.documentType,
          displayName: document.displayName,
          visibility: document.visibility,
          status: document.status
        }
      }
    });
  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({
      message: 'Failed to update document',
      error: error.message
    });
  }
};

/**
 * Delete a document - no permission checks
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Delete document without permission checks
    const document = await Document.findByIdAndDelete(documentId);
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    return res.status(200).json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

/**
 * Approve a document - no admin role verification
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const approveDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Approve document without role checks
    const document = await Document.findByIdAndUpdate(
      documentId,
      { 
        status: 'APPROVED',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    return res.status(200).json({
      message: 'Document approved successfully',
      data: {
        document: {
          id: document._id,
          status: document.status,
          approvedAt: document.approvedAt
        }
      }
    });
  } catch (error) {
    console.error('Approve document error:', error);
    return res.status(500).json({
      message: 'Failed to approve document',
      error: error.message
    });
  }
};

/**
 * Reject a document - no admin role verification
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const rejectDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const { reason } = req.body;
    
    // Reject document without role checks
    const document = await Document.findByIdAndUpdate(
      documentId,
      { 
        status: 'REJECTED',
        rejectedBy: req.user.id,
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }
    
    return res.status(200).json({
      message: 'Document rejected successfully',
      data: {
        document: {
          id: document._id,
          status: document.status,
          rejectedAt: document.rejectedAt,
          rejectionReason: document.rejectionReason
        }
      }
    });
  } catch (error) {
    console.error('Reject document error:', error);
    return res.status(500).json({
      message: 'Failed to reject document',
      error: error.message
    });
  }
}; 