// backend/src/models/UserProgress.js
import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastRead: {
    type: Date,
    default: Date.now
  },
  currentChapter: Number,
  notes: [{ 
    page: Number,
    content: String,
    createdAt: Date
  }]
});

export default mongoose.model('UserProgress', userProgressSchema);