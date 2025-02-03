// backend/src/controllers/graphController.js
import Book from '../models/Book.js';

export const getGraphData = async (req, res) => {
  try {
    const userId = req.user._id;
    const books = await Book.find().populate('readStatus.userId ratings.userId connections.bookId');

    const nodes = [];
    const links = [];
    const processedAuthors = new Set();
    const processedSeries = new Set();

    books.forEach(book => {
      // Add book node
      nodes.push({
        id: book._id.toString(),
        type: 'Book',
        title: book.title,
        size: 5 + (book.ratings?.length || 0) * 0.5,
        isRead: book.readStatus?.some(s => 
          s.userId.toString() === userId.toString() && s.status === 'READ'
        )
      });

      // Add author node
      if (!processedAuthors.has(book.author)) {
        nodes.push({
          id: `author_${book.author}`,
          type: 'Author',
          name: book.author
        });
        processedAuthors.add(book.author);
      }

      // Add author link
      links.push({
        source: book._id.toString(),
        target: `author_${book.author}`,
        type: 'WRITTEN_BY'
      });

      // Add series if exists
      if (book.series?.name && !processedSeries.has(book.series.name)) {
        nodes.push({
          id: `series_${book.series.name}`,
          type: 'Series',
          name: book.series.name
        });
        processedSeries.add(book.series.name);

        links.push({
          source: book._id.toString(),
          target: `series_${book.series.name}`,
          type: 'PART_OF'
        });
      }

      // Add genre and tag nodes/links
      book.genres.forEach(genre => {
        const genreId = `genre_${genre}`;
        if (!nodes.some(n => n.id === genreId)) {
          nodes.push({
            id: genreId,
            type: 'Genre',
            name: genre
          });
        }
        links.push({
          source: book._id.toString(),
          target: genreId,
          type: 'IN_GENRE'
        });
      });

      book.tags.forEach(tag => {
        const tagId = `tag_${tag}`;
        if (!nodes.some(n => n.id === tagId)) {
          nodes.push({
            id: tagId,
            type: 'Tag',
            name: tag
          });
        }
        links.push({
          source: book._id.toString(),
          target: tagId,
          type: 'HAS_TAG'
        });
      });

      // Add book connections
      book.connections?.forEach(conn => {
        links.push({
          source: book._id.toString(),
          target: conn.bookId.toString(),
          type: conn.relationshipType
        });
      });
    });

    res.json({ nodes, links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userReadBooks = await Book.find({
      'readStatus.userId': userId,
      'readStatus.status': 'READ'
    });

    // Calculate user preferences
    const genreScores = {};
    const tagScores = {};

    userReadBooks.forEach(book => {
      const userRating = book.ratings.find(r => 
        r.userId.toString() === userId.toString()
      )?.rating || 3;

      book.genres.forEach(genre => {
        genreScores[genre] = genreScores[genre] || { sum: 0, count: 0 };
        genreScores[genre].sum += userRating;
        genreScores[genre].count++;
      });

      book.tags.forEach(tag => {
        tagScores[tag] = tagScores[tag] || { sum: 0, count: 0 };
        tagScores[tag].sum += userRating;
        tagScores[tag].count++;
      });
    });

    // Find and score recommendations
    const unreadBooks = await Book.find({
      '_id': { $nin: userReadBooks.map(b => b._id) }
    });

    const recommendations = unreadBooks.map(book => {
      let score = 0;
      let matchFactors = [];

      // Score based on genres
      book.genres.forEach(genre => {
        if (genreScores[genre]) {
          const genreScore = genreScores[genre].sum / genreScores[genre].count;
          score += genreScore * 2;
          if (genreScore > 3) {
            matchFactors.push(`Enjoyed ${genre} books`);
          }
        }
      });

      // Score based on tags
      book.tags.forEach(tag => {
        if (tagScores[tag]) {
          const tagScore = tagScores[tag].sum / tagScores[tag].count;
          score += tagScore;
          if (tagScore > 3) {
            matchFactors.push(`Liked books with ${tag}`);
          }
        }
      });

      return {
        book,
        score: score / (book.genres.length + book.tags.length),
        matchFactors: [...new Set(matchFactors)].slice(0, 3)
      };
    });

    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(r => ({
        ...r.book.toObject(),
        matchScore: Math.round(r.score * 100) / 100,
        matchFactors: r.matchFactors
      }));

    res.json(topRecommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};