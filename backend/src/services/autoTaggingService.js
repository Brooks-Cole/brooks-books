// backend/src/services/autoTaggingService.js
import natural from 'natural';
import nlp from 'compromise';
import paragraphs from 'compromise-paragraphs';
nlp.extend(paragraphs);

class AutoTaggingService {
  constructor() {
    this.tfidf = new natural.TfIdf();
    this.tokenizer = new natural.WordTokenizer();
    this.stopwords = new Set(natural.stopwords);
    
    // Add custom stopwords relevant to books
    this.stopwords.add('book');
    this.stopwords.add('chapter');
    this.stopwords.add('page');
  }

  // Extract keywords from text using TF-IDF
  extractKeywords(text, maxKeywords = 10) {
    this.tfidf = new natural.TfIdf();
    this.tfidf.addDocument(text);
    
    const scores = [];
    this.tfidf.listTerms(0).forEach(item => {
      const term = item.term.toLowerCase();
      if (
        term.length > 2 && // Skip very short words
        !this.stopwords.has(term) && // Skip stopwords
        /^[a-z]+$/.test(term) // Only include pure alphabetical terms
      ) {
        scores.push({
          term,
          score: item.tfidf
        });
      }
    });

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxKeywords)
      .map(item => item.term);
  }

  // Extract themes using NLP analysis
  extractThemes(text) {
    const doc = nlp(text);
    const themes = new Set();

    // Extract nouns that appear multiple times
    doc.nouns().out('frequency').forEach(freq => {
      if (freq.count > 1 && !this.stopwords.has(freq.normal)) {
        themes.add(freq.normal);
      }
    });

    // Extract key actions
    doc.verbs().out('frequency').forEach(freq => {
      if (freq.count > 2 && !this.stopwords.has(freq.normal)) {
        themes.add(freq.normal);
      }
    });

    // Extract emotions and sentiments
    doc.sentences().forEach(sent => {
      const text = sent.text().toLowerCase();
      if (text.includes('love') || text.includes('hate') ||
          text.includes('fear') || text.includes('hope')) {
        themes.add('emotional');
      }
      if (text.includes('magic') || text.includes('wizard') ||
          text.includes('spell')) {
        themes.add('magical');
      }
      if (text.includes('science') || text.includes('experiment') ||
          text.includes('discovery')) {
        themes.add('scientific');
      }
    });

    return Array.from(themes);
  }

  // Analyze text content and generate tags
  async generateTags(text, existingTags = []) {
    const keywords = this.extractKeywords(text);
    const themes = this.extractThemes(text);
    
    // Combine and deduplicate tags
    const allTags = new Set([...existingTags, ...keywords, ...themes]);
    
    // Filter out generic or low-value tags
    const filteredTags = Array.from(allTags).filter(tag => 
      tag.length > 2 && // Skip very short tags
      !this.stopwords.has(tag.toLowerCase()) // Skip stopwords
    );

    return filteredTags;
  }

  // Analyze a Gutenberg book and generate tags
  async analyzeGutenbergBook(bookData) {
    const textToAnalyze = [
      bookData.title,
      bookData.description,
      ...(bookData.subjects || [])
    ].join(' ');

    const generatedTags = await this.generateTags(textToAnalyze, bookData.tags);
    
    return {
      ...bookData,
      tags: generatedTags
    };
  }

  // Clean and normalize tags
  cleanTags(tags) {
    return tags
      .map(tag => tag.toLowerCase().trim())
      .filter(tag => 
        tag.length > 2 && 
        !this.stopwords.has(tag)
      )
      .map(tag => natural.PorterStemmer.stem(tag))
      .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
  }
}

export default new AutoTaggingService();