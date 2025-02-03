// backend/src/routes/books.js
import express from 'express';
import multer from 'multer';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadToS3 } from '../middleware/upload.js';
import xlsx from 'xlsx';
import { awardPoints } from '../middleware/points.js';
import gutenbergService from '../services/gutenbergService.js';
import autoTaggingService from '../services/autoTaggingService.js';
import config from '../../../frontend/src/config/config.js';

// Single upload declaration for both drawings and vocabulary
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

const BOOKS_PER_PAGE = 25;

router.get('/tags', async (req, res) => {
  try {
    const books = await Book.find();
    const uniqueTags = [...new Set(books.flatMap(book => book.tags || []))];
    res.json({ tags: uniqueTags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/available-tags', async (req, res) => {
  try {
    const books = await Book.find({}, 'tags');
    const uniqueTags = [...new Set(books.flatMap(book => book.tags || []))];
    res.json({ tags: uniqueTags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to your existing routes
router.post('/:id/vocabulary/upload', [auth, adminAuth], upload.single('vocabulary'), async (req, res) => {
  try {
    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const vocabulary = xlsx.utils.sheet_to_json(sheet);

    // Update the book with new vocabulary
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          vocabulary: { 
            $each: vocabulary 
          } 
        } 
      },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error uploading vocabulary:', error);
    res.status(400).json({ error: error.message });
  }
});

//pagination to split books up for loading time, but mainting search across all pages
router.get('/', async (req, res) => {
  try {
    const { limit = 25, page = 1, search, genre, tag } = req.query;

    // If limit=all, return all books without pagination
    if (limit === 'all') {
      const query = buildSearchQuery(search, genre, tag);
      const books = await Book.find(query).sort({ addedAt: -1 });
      return res.json({
        books,
        totalBooks: books.length,
        currentPage: 1,
        totalPages: 1
      });
    }

    // Build search query
    const query = buildSearchQuery(search, genre, tag);

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limitNumber);

    // Get paginated books
    const books = await Book.find(query)
      .sort({ addedAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      books,
      currentPage: pageNumber,
      totalPages,
      totalBooks
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(400).json({ error: error.message });
  }
});

// Helper function to build search query
function buildSearchQuery(search, genre, tag) {
  const query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (genre) {
    query.genres = genre;
  }
  
  if (tag) {
    query.tags = tag;
  }
  
  return query;
}

// Add this with your other routes in books.js
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const { tags } = req.body;
    
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Add new tags to existing tags, remove duplicates
    const updatedTags = [...new Set([...book.tags || [], ...tags])];
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { tags: updatedTags },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    console.error('Error adding tags:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const { limit = 25, page = 1 } = req.query;
    
    // If limit=all, return all books without pagination
    if (limit === 'all') {
      const books = await Book.find({})
        .sort({ addedAt: -1 });
      return res.json({ 
        books,
        totalBooks: books.length,
        currentPage: 1,
        totalPages: 1
      });
    }

    // Otherwise, use pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Get total count for pagination
    const totalBooks = await Book.countDocuments();
    const totalPages = Math.ceil(totalBooks / limitNumber);

    // Get paginated books
    const books = await Book.find({})
      .sort({ addedAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      books,
      currentPage: pageNumber,
      totalPages,
      totalBooks
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(400).json({ error: error.message });
  }
});

// New endpoint for exporting all books
router.get('/export', [auth, adminAuth], async (req, res) => {
  try {
    const books = await Book.find({})
      .populate('drawings')
      .lean();
    
    console.log(`Exporting ${books.length} books`);
    res.json(books);
  } catch (error) {
    console.error('Error exporting books:', error);
    res.status(500).json({ error: 'Failed to export books' });
  }
});

// Update book (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    console.log('Updating book:', req.params.id); // Debug log
    console.log('Update data:', req.body); // Debug log
    
    const { title, author, description, ageRange, genres, tags } = req.body;
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        description,
        ageRange,
        genres,
        tags
      },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new book
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, ageRange, genres, tags } = req.body;
    
    // Create book in MongoDB
    const book = new Book({
      title,
      author,
      description,
      ageRange,
      genres,
      tags
    });

    await book.save();

    // Add book to Neo4j graph
    try {
      await graphService.addBook(book);
      console.log('Book added to graph database');
    } catch (graphError) {
      console.error('Error adding book to graph:', graphError);
      // Note: We don't want to fail the whole request if graph update fails
    }

    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(400).json({ error: error.message });
  }
});

//bulk uploads
router.post('/bulk-upload', [auth, adminAuth], upload.single('bookList'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = xlsx.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const books = xlsx.utils.sheet_to_json(sheet);

    // Process and validate each book
    const processedBooks = books.map(book => ({
      title: book.title,
      author: book.author,
      description: book.description,
      genres: book.genres?.split(/[,;]/).map(g => g.trim()) || [],
      ageRange: {
        min: parseInt(book.minAge) || 8,
        max: parseInt(book.maxAge) || 15
      },
      tags: book.tags?.split(/[,;]/).map(t => t.trim()) || []
    }));

    // Save books to database
    const savedBooks = await Promise.all(
      processedBooks.map(async bookData => {
        const book = new Book(bookData);
        await book.save();
        
        // Also add to Neo4j
        try {
          await graphService.addBook(book);
        } catch (graphError) {
          console.error('Error adding book to graph:', graphError);
        }
        
        return book;
      })
    );

    res.status(201).json({
      message: `Successfully uploaded ${savedBooks.length} books`,
      books: savedBooks
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(400).json({ error: error.message });
  }
});

//gutenberg import & check for matching books
router.post('/gutenberg/import/:gutenbergId', auth, adminAuth, async (req, res) => {
  try {
    const gutenbergBook = await gutenbergService.getBook(req.params.gutenbergId);
    if (!gutenbergBook) {
      return res.status(404).json({ error: 'Gutenberg book not found' });
    }

    // Transform and analyze book data
    let bookData = gutenbergService.transformBookData(gutenbergBook);
    bookData = await autoTaggingService.analyzeGutenbergBook(bookData);

    // Find potential matches using more flexible search
    const potentialMatches = await Book.find({
      $or: [
        // Match by exact title
        { title: { $regex: new RegExp(`^${bookData.title}$`, 'i') } },
        // Match by similar title (remove common words and punctuation)
        { title: { $regex: new RegExp(bookData.title.replace(/[^\w\s]/g, '').replace(/\b(the|a|an)\b/gi, ''), 'i') } }
      ]
    });

    // Return the potential matches along with the Gutenberg data
    res.json({
      gutenbergBook: bookData,
      potentialMatches: potentialMatches
    });

  } catch (error) {
    console.error('Error importing Gutenberg book:', error);
    res.status(500).json({ error: 'Failed to import book from Gutenberg' });
  }
});

// Add a new route to handle the actual merge/import after confirmation
router.post('/gutenberg/confirm-import', [auth, adminAuth], async (req, res) => {
  try {
    const { gutenbergBook, existingBookId, shouldMerge } = req.body;

    if (shouldMerge && existingBookId) {
      // Merge with existing book
      const existingBook = await Book.findById(existingBookId);
      if (!existingBook) {
        return res.status(404).json({ error: 'Existing book not found' });
      }

      const mergedGenres = [...new Set([...existingBook.genres, ...gutenbergBook.genres])];
      const mergedTags = [...new Set([...existingBook.tags, ...gutenbergBook.tags])];

      const updatedBook = await Book.findByIdAndUpdate(
        existingBookId,
        {
          $set: {
            genres: mergedGenres,
            tags: mergedTags,
            description: existingBook.description || gutenbergBook.description,
            metadata: {
              ...existingBook.metadata,
              gutenbergId: gutenbergBook.gutenbergId,
              languages: gutenbergBook.languages,
              downloadCount: gutenbergBook.downloadCount,
              formats: gutenbergBook.formats
            }
          }
        },
        { new: true }
      );

      return res.json({
        message: 'Book merged successfully',
        book: updatedBook
      });
    } else {
      // Create new book
      const book = new Book({
        title: gutenbergBook.title,
        author: gutenbergBook.author,
        description: gutenbergBook.description,
        genres: gutenbergBook.genres,
        tags: gutenbergBook.tags,
        ageRange: {
          min: 8,
          max: 15
        },
        metadata: {
          gutenbergId: gutenbergBook.gutenbergId,
          languages: gutenbergBook.languages,
          downloadCount: gutenbergBook.downloadCount,
          formats: gutenbergBook.formats
        }
      });

      await book.save();
      return res.status(201).json({
        message: 'Book imported successfully',
        book
      });
    }
  } catch (error) {
    console.error('Error confirming book import:', error);
    return res.status(500).json({ error: 'Failed to import/merge book' });
  }
});


// Upload drawing
// backend/src/routes/books.js
// Update the drawing upload route:

router.post('/:bookId/drawings', auth, upload.single('drawing'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Book ID:', req.params.bookId);
    console.log('File:', req.file);  // Add this to debug

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Upload to S3
    try {
      const imageUrl = await uploadToS3(req.file);
      console.log('Image uploaded to S3:', imageUrl);

      // Add drawing to book
      const drawing = {
        userId: req.user._id,
        imageUrl: imageUrl,
        likes: []
      };

      book.drawings.push(drawing);
      await book.save();

      // Award points for uploading
      const pointsResult = await awardPoints(req.user._id, 'UPLOAD_DRAWING', {
        bookId: book._id,
        drawingId: drawing._id
      });

      res.status(201).json({
        message: 'Drawing uploaded successfully',
        book,
        pointsAwarded: pointsResult.pointsAwarded,
        newAchievements: pointsResult.newAchievements
      });
    } catch (uploadError) {
      console.error('S3 Upload Error:', uploadError);
      return res.status(400).json({ error: 'Failed to upload image to S3' });
    }
  } catch (error) {
    console.error('Route Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Like a drawing
router.post('/:bookId/drawings/:drawingId/like', auth, async (req, res) => {
  try {
    console.log('Like request received:', {
      userId: req.user._id,
      bookId: req.params.bookId,
      drawingId: req.params.drawingId
    });

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const drawing = book.drawings.id(req.params.drawingId);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    // Check if user already liked this drawing
    const alreadyLiked = drawing.likes?.includes(req.user._id);
    console.log('Already liked:', alreadyLiked);

    if (alreadyLiked) {
      return res.status(400).json({ error: 'Already liked this drawing' });
    }

    // Add like
    drawing.likes = drawing.likes || [];
    drawing.likes.push(req.user._id);
    await book.save();

    console.log('Like added successfully', {
      newLikesCount: drawing.likes.length,
      likes: drawing.likes
    });

    res.json({
      message: 'Drawing liked successfully',
      likes: drawing.likes.length
    });
  } catch (error) {
    console.error('Error in like route:', error);
    res.status(400).json({ error: error.message });
  }
});

// Unlike a drawing
router.post('/:bookId/drawings/:drawingId/unlike', auth, async (req, res) => {
  try {
    console.log('Unlike request received:', {
      userId: req.user._id,
      bookId: req.params.bookId,
      drawingId: req.params.drawingId
    });

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const drawing = book.drawings.id(req.params.drawingId);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    // Remove like if it exists
    const likeIndex = drawing.likes?.indexOf(req.user._id);
    console.log('Like index:', likeIndex);

    if (likeIndex === -1) {
      return res.status(400).json({ error: 'Drawing not liked yet' });
    }

    drawing.likes.splice(likeIndex, 1);
    await book.save();

    console.log('Like removed successfully', {
      newLikesCount: drawing.likes.length,
      likes: drawing.likes
    });

    res.json({
      message: 'Drawing unliked successfully',
      likes: drawing.likes.length
    });
  } catch (error) {
    console.error('Error in unlike route:', error);
    res.status(400).json({ error: error.message });
  }
});

// Add a comment to a drawing
router.post('/:bookId/drawings/:drawingId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const drawing = book.drawings.id(req.params.drawingId);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const comment = {
      userId: req.user._id,
      username: req.user.username,
      content: content.trim(),
      createdAt: new Date()
    };

    drawing.comments.push(comment);
    await book.save();

    // Award points to drawing owner
    const pointsResult = await awardPoints(drawing.userId, 'RECEIVE_COMMENT', {
      bookId: book._id,
      drawingId: drawing._id,
      commentId: comment._id
    });

    res.status(201).json({
      comment,
      pointsAwarded: pointsResult.pointsAwarded,
      newAchievements: pointsResult.newAchievements
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/:bookId/drawings/:drawingId/comments/:commentId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const drawing = book.drawings.id(req.params.drawingId);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    const comment = drawing.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is authorized to delete the comment
    if (comment.userId.toString() !== req.user._id.toString() && 
        drawing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await book.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all comments for a drawing
router.get('/:bookId/drawings/:drawingId/comments', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const drawing = book.drawings.id(req.params.drawingId);
    if (!drawing) {
      return res.status(404).json({ error: 'Drawing not found' });
    }

    res.json(drawing.comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/gutenberg/search', auth, async (req, res) => {
  try {
    const { query, page } = req.query;
    const results = await gutenbergService.searchBooks(query, page);
    
    // Transform results to match your format
    const books = results.results.map(book => 
      gutenbergService.transformBookData(book)
    );
    
    res.json({
      books,
      count: results.count,
      next: results.next,
      previous: results.previous
    });
  } catch (error) {
    console.error('Error searching Gutenberg:', error);
    res.status(500).json({ error: 'Failed to search Gutenberg books' });
  }
});

// Import a book from Gutenberg
router.post('/gutenberg/import/:gutenbergId', auth, adminAuth, async (req, res) => {
  try {
    const gutenbergBook = await gutenbergService.getBook(req.params.gutenbergId);
    if (!gutenbergBook) {
      return res.status(404).json({ error: 'Gutenberg book not found' });
    }

    // Transform and analyze book data
    let bookData = gutenbergService.transformBookData(gutenbergBook);
    bookData = await autoTaggingService.analyzeGutenbergBook(bookData);

    // Create new book in your database
    const book = new Book({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      genres: bookData.genres,
      tags: bookData.tags,
      ageRange: {
        min: 8,  // You might want to make this configurable
        max: 15
      },
      metadata: {
        gutenbergId: bookData.gutenbergId,
        languages: bookData.languages,
        downloadCount: bookData.downloadCount,
        formats: bookData.formats
      }
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Error importing Gutenberg book:', error);
    res.status(500).json({ error: 'Failed to import book from Gutenberg' });
  }
});



// Generate tags for existing book
router.post('/:id/generate-tags', auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Analyze book content and generate tags
    const textToAnalyze = [
      book.title,
      book.description,
      book.author,
      ...(book.tags || [])
    ].join(' ');

    const generatedTags = await autoTaggingService.generateTags(textToAnalyze, book.tags);
    
    // Update book with new tags
    book.tags = generatedTags;
    await book.save();

    res.json(book);
  } catch (error) {
    console.error('Error generating tags:', error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
});

export default router;