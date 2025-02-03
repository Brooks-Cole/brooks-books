// backend/src/routes/graphRoutes.js
import express from 'express';
import { getGraphData, getRecommendations } from '../controllers/graphController.js';
import auth from '../middleware/auth.js';  // Changed from authMiddleware

const router = express.Router();

router.get('/graph', auth, getGraphData);
router.get('/recommendations', auth, getRecommendations);

export default router;