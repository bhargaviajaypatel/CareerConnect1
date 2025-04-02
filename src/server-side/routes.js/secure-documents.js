import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const router = express.Router();

// Basic authentication middleware
const authenticateJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerconnect-dev-secret');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Apply authentication to all document routes
router.use(authenticateJWT);

// Configure storage for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Get allowed file types from environment or use defaults
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 
    "application/pdf,image/jpeg,image/png,image/jpg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    .split(",");
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}`), false);
  }
};

// Configure multer
const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880") // Default 5MB
  },
  fileFilter
});

// Route to upload documents
router.post(
  "/upload",
  upload.single("document"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded"
        });
      }

      // Document metadata to save to database
      const documentData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      };

      // In a real application, you would save this metadata to your database
      // const savedDocument = await Document.create(documentData);

      return res.status(201).json({
        status: "success",
        message: "Document uploaded successfully",
        data: {
          document: {
            id: "temp-id", // Would be savedDocument._id in a real application
            filename: documentData.originalName,
            uploadedAt: documentData.uploadedAt
          }
        }
      });
    } catch (error) {
      console.error("Document upload error:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "An error occurred during document upload"
      });
    }
  }
);

// Route to get list of user's documents
router.get(
  "/",
  (req, res) => {
    try {
      // In a real application, you would fetch documents from the database
      // const documents = await Document.find({ uploadedBy: req.user.id });

      // Mock response
      const documents = [
        {
          id: "doc1",
          filename: "resume.pdf",
          uploadedAt: new Date()
        }
      ];

      return res.status(200).json({
        status: "success",
        message: "Documents retrieved successfully",
        data: {
          documents
        }
      });
    } catch (error) {
      console.error("Document retrieval error:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while retrieving documents"
      });
    }
  }
);

// Route to get a single document
router.get(
  "/:id",
  (req, res) => {
    try {
      const documentId = req.params.id;

      // In a real application, you would fetch the document from the database
      // const document = await Document.findById(documentId);
      
      // Mock response
      const document = {
        id: documentId,
        filename: "resume.pdf",
        path: path.join(process.cwd(), "uploads", "sample.pdf"),
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      };

      // This check would be handled by the database query in a real app
      if (document.uploadedBy !== req.user.id) {
        return res.status(403).json({
          status: "error",
          message: "You do not have permission to access this document"
        });
      }

      // In a real app, you would stream the file or generate a signed URL
      return res.status(200).json({
        status: "success",
        message: "Document retrieved successfully",
        data: {
          document: {
            id: document.id,
            filename: document.filename,
            uploadedAt: document.uploadedAt
          }
        }
      });
    } catch (error) {
      console.error("Document retrieval error:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while retrieving the document"
      });
    }
  }
);

// Route to delete a document
router.delete(
  "/:id",
  (req, res) => {
    try {
      const documentId = req.params.id;

      // In a real application, you would:
      // 1. Find the document to check ownership
      // const document = await Document.findById(documentId);
      
      // 2. Check ownership
      // if (document.uploadedBy !== req.user.id) {
      //   return res.status(403).json({
      //     status: "error",
      //     message: "You do not have permission to delete this document"
      //   });
      // }
      
      // 3. Delete the file
      // fs.unlinkSync(document.path);
      
      // 4. Delete from database
      // await Document.findByIdAndDelete(documentId);

      return res.status(200).json({
        status: "success",
        message: "Document deleted successfully"
      });
    } catch (error) {
      console.error("Document deletion error:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while deleting the document"
      });
    }
  }
);

export { router as SecureDocumentsRouter }; 