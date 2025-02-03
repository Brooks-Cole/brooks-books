// backend/src/routes/series.js
import express from 'express';
import Series from '../models/Series.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import graphService from '../services/graphService.js';

const router = express.Router();

// Get all series
router.get('/', async (req, res) => {
  try {
    const series = await Series.find();
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single series
router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new series (admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const series = new Series(req.body);
    await series.save();

    // Add to graph database
    await graphService.addOrUpdateSeries({
      ...req.body,
      id: series._id.toString()
    });

    res.status(201).json(series);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update series (admin only)
// backend/src/routes/series.js - Update the PUT route

router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    console.log('Updating series:', {
      seriesId: req.params.id,
      updateData: req.body
    });
    console.log('Book IDs being added to series:', {
      seriesId: series._id.toString(),
      bookIds: series.books.map(book => book.id)
    });
    
    // First update MongoDB
    const series = await Series.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    console.log('MongoDB update successful, syncing with Neo4j...');

    // Then update Neo4j
    await graphService.addOrUpdateSeries({
      id: series._id.toString(),
      name: series.name,
      description: series.description,
      author: series.author,
      genres: series.genres,
      books: series.books.map(book => ({
        id: book.id,
        title: book.title,
        description: book.description,
        minAge: book.minAge,
        maxAge: book.maxAge
      }))
    });

    console.log('Neo4j sync complete');

    res.json(series);
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete series (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const series = await Series.findByIdAndDelete(req.params.id);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Remove from graph database
    await graphService.removeSeries(series._id.toString());

    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;