// backend/src/middleware/upload.js
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3.js';
import jwt from 'jsonwebtoken';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log('File filter running for:', file.originalname);
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

const uploadToS3 = async (file) => {
  try {
    console.log('Starting S3 upload process...');
    
    const key = `images/${Date.now()}-${file.originalname}`;
    console.log('Generated S3 key:', key);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    console.log('Attempting S3 upload with params:', {
      ...params,
      Body: '[Buffer content]'
    });

    const result = await s3Client.send(new PutObjectCommand(params));
    console.log('S3 upload successful:', result);

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log('Generated URL:', url);
    return url;

  } catch (error) {
    console.error('Detailed S3 Upload Error:', {
      message: error.message,
      code: error.code,
      requestId: error.$metadata?.requestId,
      details: error.details
    });
    throw new Error(`S3 Upload Failed: ${error.message}`);
  }
};

// Enhanced authentication middleware
const authenticateUpload = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format');
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in auth header');
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    // Verify the token and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', { ...decoded, password: '[REDACTED]' });

    // Check if user has admin role
    if (!decoded.isAdmin) {
      console.log('User is not an admin:', decoded.email);
      return res.status(403).json({ message: 'Admin access required for bulk upload' });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export { upload, uploadToS3, authenticateUpload };