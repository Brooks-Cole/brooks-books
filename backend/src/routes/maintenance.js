// backend/src/routes/maintenance.js
import express from 'express';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { syncBooksToGraph } from '../utils/graphSync.js';

const router = express.Router();

// Endpoint to manually trigger graph sync (admin only)
router.post('/sync-graph', [auth, adminAuth], async (req, res) => {
  try {
    await syncBooksToGraph();
    res.json({ message: 'Graph sync completed successfully' });
  } catch (error) {
    console.error('Error during graph sync:', error);
    res.status(500).json({ error: 'Failed to sync graph database' });
  }
});

router.get('/graph-state', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await graphService.checkGraphState();
    res.json(stats);
  } catch (error) {
    console.error('Error checking graph state:', error);
    res.status(500).json({ error: 'Failed to check graph state' });
  }
});


export default router;