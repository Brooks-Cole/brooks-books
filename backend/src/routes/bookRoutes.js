import express from 'express';
import { upload, uploadToS3, authenticateUpload } from '../middleware/upload.js';
import { processExcelUpload } from '../controllers/bookController.js';

const router = express.Router();

// Add both authentication middleware and upload middleware
router.post('/bulk-upload', 
  authenticateUpload, // Check authentication first
  upload.single('bookList'), // Then handle file upload
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('Processing upload for user:', req.user.email);
      
      // Upload to S3
      const fileUrl = await uploadToS3(req.file);
      
      // Process the Excel file
      const result = await processExcelUpload(fileUrl, req.user);
      
      res.json({ 
        message: 'Upload successful', 
        booksProcessed: result.booksProcessed 
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ 
        message: 'Error processing upload',
        error: error.message 
      });
    }
  }
);

export default router; 