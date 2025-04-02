import express from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  approveDocument,
  rejectDocument
} from '../controllers/documentController.js';

const router = express.Router();

// Configure multer with no restrictions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage
});

// Add userId to request from query parameter - no authentication needed
const addUserToRequest = (req, res, next) => {
  req.user = {
    id: req.query.userId
  };
  next();
};

// All document routes use userId from query parameter
router.use(addUserToRequest);

// Upload document
router.post('/upload', upload.single('document'), uploadDocument);

// Get all documents for user
router.get('/my-documents', getUserDocuments);

// Get documents for a specific user
router.get('/user/:userId', getUserDocuments);

// Get document by ID
router.get('/:id', getDocumentById);

// Download document
router.get('/:id/download', downloadDocument);

// Update document metadata
router.put('/:id', updateDocument);

// Delete document
router.delete('/:id', deleteDocument);

// Admin document approval/rejection routes
router.put('/:id/approve', approveDocument);
router.put('/:id/reject', rejectDocument);

export default router; 