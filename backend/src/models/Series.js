// backend/src/models/Series.js
import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  genres: [{
    type: String,
    required: true
  }],
  books: [{
    id: String,
    title: String,
    description: String,
    minAge: Number,
    maxAge: Number,
    tags: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Series', seriesSchema);