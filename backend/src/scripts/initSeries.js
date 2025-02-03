import { bookSeries } from '../data/bookSeries.js';
import Series from '../models/Series.js';
import connectDB from '../../config/database.js';
import graphService from '../services/graphService.js';

const initializeSeries = async () => {
  try {
    await connectDB();
    console.log('Connected to database');
    
    await Series.deleteMany({});
    console.log('Cleared existing series');
    
    for (const [key, series] of Object.entries(bookSeries)) {
      const newSeries = new Series(series);
      await newSeries.save();
      await graphService.addBookSeries(series);
      console.log(`Added series: ${series.name}`);
    }
    
    console.log('Series initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeSeries();