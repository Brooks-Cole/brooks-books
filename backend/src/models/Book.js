// backend/src/models/Book.js
import mongoose from 'mongoose';

const GENRES = [
  'Adventure', 'Fantasy', 'Mystery', 'Science',
  'Historical', 'Educational', 'Fiction', 'Non-Fiction'
];

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  coverImage: {
    type: String,
    default: null
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  series: {
    name: String,
    order: Number
  },
  genres: [{
    type: String,
    enum: GENRES,
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  themes: [{
    type: String,
    trim: true
  }],
  description: String,
  ageRange: {
    min: {
      type: Number,
      default: 8
    },
    max: {
      type: Number,
      default: 15
    }
  },
  drawings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    imageUrl: String,
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      content: {
        type: String,
        required: true,
        maxLength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  vocabulary: [{
    word: String,
    definition: String,
    options: String,
    correct_answer: String
  }],
  metadata: {
    gutenbergId: String,
    languages: [String],
    downloadCount: Number,
    formats: {
      type: Map,
      of: String
    }
  },
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readStatus: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['WANT_TO_READ', 'READING', 'READ', 'DNF'],
      default: 'WANT_TO_READ'
    },
    dateUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  connections: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    relationshipType: {
      type: String,
      enum: ['SIMILAR_THEME', 'SAME_SERIES', 'SIMILAR_STYLE', 'RECOMMENDED_NEXT']
    }
  }]
});

bookSchema.methods.getMostLikedDrawing = function() {
  if (!this.drawings || this.drawings.length === 0) {
    return null;
  }
  return this.drawings.reduce((mostLiked, current) => {
    const currentLikes = current.likes?.length || 0;
    const mostLikedCount = mostLiked.likes?.length || 0;
    return currentLikes > mostLikedCount ? current : mostLiked;
  }, this.drawings[0]);
};

// Add method to get graph data
bookSchema.methods.getGraphConnections = function() {
  return {
    id: this._id,
    type: 'Book',
    title: this.title,
    author: this.author,
    series: this.series?.name,
    genres: this.genres,
    tags: this.tags,
    themes: this.themes,
    connections: this.connections
  };
};

const Book = mongoose.model('Book', bookSchema);

export { GENRES };
export default Book;