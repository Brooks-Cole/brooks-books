// backend/src/utils/graphSync.js
import Book from '../models/Book.js';
import graphService from '../services/graphService.js';
import driver from '../config/neo4j.js';

export const syncBooksToGraph = async () => {
  const session = driver.session();
  try {
    console.log('Starting graph sync process...');
    
    // First, let's check what's in Neo4j before clearing
    const beforeCounts = await session.readTransaction(tx => 
      tx.run(`
        MATCH (b:Book) WITH count(b) as books
        MATCH (a:Author) WITH books, count(a) as authors
        MATCH (g:Genre) WITH books, authors, count(g) as genres
        MATCH (s:Series) WITH books, authors, genres, count(s) as series
        MATCH (t:Tag) WITH books, authors, genres, series, count(t) as tags
        RETURN books, authors, genres, series, tags
      `)
    );
    console.log('Current Neo4j counts before sync:', beforeCounts.records[0].toObject());

    // Clear existing book nodes and their relationships
    console.log('Clearing existing book nodes...');
    const deleteResult = await session.writeTransaction(tx =>
      tx.run(`
        MATCH (b:Book) 
        OPTIONAL MATCH (b)-[r]-() 
        DELETE r, b
        WITH count(b) as books, count(r) as rels
        RETURN books, rels
      `)
    );
    console.log('Deleted nodes/relationships:', deleteResult.records[0].toObject());

    // Get all books from MongoDB
    const books = await Book.find({}).lean();
    console.log(`Found ${books.length} books in MongoDB`);

    // Sample check of first book
    if (books.length > 0) {
      console.log('Sample book data:', JSON.stringify(books[0], null, 2));
    }

    // Track progress and errors
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Add each book to Neo4j
    for (const book of books) {
      try {
        console.log(`Processing book: ${book.title}`);
        await graphService.addBook(book);
        successCount++;
        if (successCount % 10 === 0) { // Changed from 50 to 10 for more frequent updates
          console.log(`Progress: ${successCount}/${books.length} books synced`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          bookId: book._id,
          title: book.title,
          error: error.message,
          stack: error.stack // Adding stack trace for better debugging
        });
        console.error(`Error syncing book "${book.title}":`, error);
      }
    }

    // Check final counts
    const afterCounts = await session.readTransaction(tx => 
      tx.run(`
        MATCH (b:Book) WITH count(b) as books
        MATCH (a:Author) WITH books, count(a) as authors
        MATCH (g:Genre) WITH books, authors, count(g) as genres
        MATCH (s:Series) WITH books, authors, genres, count(s) as series
        MATCH (t:Tag) WITH books, authors, genres, series, count(t) as tags
        RETURN books, authors, genres, series, tags
      `)
    );
    console.log('Neo4j counts after sync:', afterCounts.records[0].toObject());

    // Log final results
    console.log('Graph sync completed');
    console.log(`Successfully synced: ${successCount} books`);
    console.log(`Failed to sync: ${errorCount} books`);
    
    if (errors.length > 0) {
      console.log('Detailed errors:', JSON.stringify(errors, null, 2));
    }

    return {
      totalBooks: books.length,
      successCount,
      errorCount,
      errors,
      finalCounts: afterCounts.records[0].toObject()
    };

  } catch (error) {
    console.error('Fatal error during graph sync:', error);
    throw error;
  } finally {
    await session.close();
  }
};

export const updateBookInGraph = async (bookId) => {
  const session = driver.session();
  try {
    console.log(`Starting update for book ${bookId}`);
    
    // Get updated book data from MongoDB
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    // Remove existing book node and relationships
    await session.writeTransaction(tx =>
      tx.run(`
        MATCH (b:Book {id: $bookId})
        OPTIONAL MATCH (b)-[r]-()
        DELETE r, b
      `, { bookId: bookId.toString() })
    );

    // Add updated book data
    await graphService.addBook(book);
    console.log(`Successfully updated book in graph: ${book.title}`);

    return { success: true, book: book.title };
  } catch (error) {
    console.error(`Error updating book ${bookId} in graph:`, error);
    throw error;
  } finally {
    await session.close();
  }
};