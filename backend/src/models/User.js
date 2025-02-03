// backend/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    bio: {
      type: String,
      maxLength: 1000
    },
    location: String,
    website: String,
    favoriteGenres: [String],
    favoriteBooks: [{
      title: String,
      author: String,
      comment: String
    }],
    music: [{
      title: String,
      artist: String,
      spotifyUrl: String
    }],
    socialLinks: {
      instagram: String,
      twitter: String,
      goodreads: String
    },
    customization: {
      themeColor: String,
      bannerImage: String,
      layout: {
        type: String,
        enum: ['grid', 'list', 'masonry'],
        default: 'grid'
      }
    },
    pinnedDrawings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drawing'
    }]
  },
  age: {
    type: Number,
    required: true,
  },
  profilePhoto: {
    type: String,
    default: null
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: ['READER', 'ARTIST', 'HELPER', 'STAR']
  }],
  completedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  currentlyReading: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100
    },
    startDate: Date,
    lastUpdated: Date
  }],
  isAdmin: {
    type: Boolean,
    default: false
  },
  achievements: [{
    type: String,
    enum: ['BEGINNER_ARTIST', 'REGULAR_ARTIST', 'MASTER_ARTIST', 'POPULAR_DRAWING', 'BOOKWORM']
  }],
  totalLikes: {
    type: Number,
    default: 0
  },
  pointsHistory: [{
    action: String,
    points: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Object,
      default: {}
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);