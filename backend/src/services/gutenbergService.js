// backend/src/services/gutenbergService.js
import fetch from 'node-fetch';

class GutenbergService {
  constructor() {
    this.baseUrl = 'https://gutendex.com/books/'; // Gutendex is a modern REST API for Gutenberg
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Rate limiting helper
  async rateLimitedFetch(url, options = {}) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Basic rate limiting
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Gutenberg API error: ${response.statusText}`);
    }
    return response.json();
  }

  // Search Gutenberg books
  async searchBooks(query, page = 1) {
    const cacheKey = `search:${query}:${page}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}?search=${encodedQuery}&page=${page}`;
    
    try {
      const data = await this.rateLimitedFetch(url);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error searching Gutenberg books:', error);
      throw error;
    }
  }

  // Get a specific book by ID
  async getBook(gutenbergId) {
    const cacheKey = `book:${gutenbergId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const data = await this.rateLimitedFetch(`${this.baseUrl}/${gutenbergId}`);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching Gutenberg book:', error);
      throw error;
    }
  }

  // Map Gutenberg subjects to your genre system
  mapSubjectsToGenres(subjects) {
    const genreMap = {
      'Fiction': ['Fiction', 'Stories'],
      'Adventure': ['Adventure stories', 'Adventure and adventurers'],
      'Fantasy': ['Fantasy', 'Fantasy fiction', 'Magic'],
      'Mystery': ['Mystery', 'Detective and mystery stories'],
      'Science': ['Science', 'Science -- Study and teaching'],
      'Historical': ['History', 'Historical fiction'],
      'Educational': ['Education', 'Study and teaching'],
      'Non-Fiction': ['Biography', 'Essays', 'Reference']
    };

    const matchedGenres = new Set();

    subjects.forEach(subject => {
      for (const [genre, keywords] of Object.entries(genreMap)) {
        if (keywords.some(keyword => 
          subject.toLowerCase().includes(keyword.toLowerCase())
        )) {
          matchedGenres.add(genre);
        }
      }
    });

    return Array.from(matchedGenres);
  }

  // Extract relevant metadata from Gutenberg book
  transformBookData(gutenbergBook) {
    return {
      title: gutenbergBook.title,
      author: gutenbergBook.authors?.[0]?.name || 'Unknown',
      description: this.generateDescription(gutenbergBook),
      genres: this.mapSubjectsToGenres(gutenbergBook.subjects || []),
      tags: gutenbergBook.subjects || [],
      gutenbergId: gutenbergBook.id,
      languages: gutenbergBook.languages || [],
      downloadCount: gutenbergBook.download_count,
      formats: gutenbergBook.formats || {}
    };
  }

  // Generate a description from available metadata
  generateDescription(gutenbergBook) {
    const parts = [];
    
    if (gutenbergBook.subjects?.length) {
      parts.push(`This book covers: ${gutenbergBook.subjects.slice(0, 3).join(', ')}`);
    }
    
    if (gutenbergBook.authors?.[0]) {
      const author = gutenbergBook.authors[0];
      parts.push(`Written by ${author.name}${author.birth_year ? ` (${author.birth_year}-${author.death_year || ''})` : ''}`);
    }

    if (gutenbergBook.download_count) {
      parts.push(`Downloaded ${gutenbergBook.download_count} times from Project Gutenberg`);
    }

    return parts.join('. ');
  }
}

export default new GutenbergService();