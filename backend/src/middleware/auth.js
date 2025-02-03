// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import your User model

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Use optional chaining

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => { // Make callback async
      if (err) {
        req.user = null;
      } else {
        try {
          const user = await User.findById(decoded.userId).select('-password'); // Fetch user
          if (!user) {
            req.user = null; // Token valid but user not found
          } else {
            req.user = {
              _id: user._id, // Use the user object from the database
              userId: user._id,
              isAdmin: user.isAdmin
            };
          }
        } catch (dbError) {
          console.error("Error fetching user from database:", dbError);
          req.user = null; // Database error, treat as invalid token
        }
      }
      next();
    });
  } catch (error) {
    console.error("Optional auth error:", error);
    req.user = null;
    next();
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Use optional chaining

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => { // Make callback async
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      try {
        const user = await User.findById(decoded.userId).select('-password'); // Fetch user
        if (!user) {
          return res.status(401).json({ message: 'Invalid token' }); // Token valid but user not found
        }
        req.user = {
          _id: user._id, // Use the user object from the database
          userId: user._id,
          isAdmin: user.isAdmin
        };
        next();
      } catch (dbError) {
        console.error("Error fetching user from database:", dbError);
        return res.status(500).json({ message: 'Database error during authentication' });
      }
    });
  } catch (error) {
    console.error("Require auth error:", error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

export default requireAuth;