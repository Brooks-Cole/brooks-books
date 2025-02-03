// frontend/src/services/vocabularyService.js
import config from '../config/config.js';

class VocabularyService {
  constructor() {
    this.baseUrl = `${config.apiUrl}/vocabulary`;
  }

  async getBookVocabulary(bookId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/book/${bookId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        // Token is invalid or expired
        localStorage.removeItem('token'); // Clear invalid token
        window.location.href = '/login'; // Redirect to login
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getBookVocabulary:', error);
      throw error;
    }
  }

  handleResponse(response) {
    if (response.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    return response.json();
  }

  async addVocabularyWord(bookId, word) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Match the backend POST '/' route exactly
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word,
          bookId,
          // Add any other required fields from your Vocabulary model
          context: {}, // Optional
          etymology: {} // Optional
        })
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        console.error('Server response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Word saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in addVocabularyWord:', error);
      throw error;
    }
  }

  async getQuizForBook(bookId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/book/${bookId}/quiz`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getQuizForBook:', error);
      throw error;
    }
  }
}

const vocabularyService = new VocabularyService();
export default vocabularyService;