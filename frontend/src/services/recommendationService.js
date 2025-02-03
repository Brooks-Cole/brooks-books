// frontend/src/services/recommendationService.js
import config from '../config/config.js';

class RecommendationService {
  constructor() {
    this.baseUrl = `${config.apiUrl}/recommendations`;
    this.getHeaders = () => ({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  async getSimilarBooks(bookId) {
    try {
      const response = await fetch(`${this.baseUrl}/similar/${bookId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching similar books:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  async getBooksByTag(tag) {
    try {
      const response = await fetch(`${this.baseUrl}/tag/${encodeURIComponent(tag)}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching books by tag:', error);
      throw error;
    }
  }

  async getFullGraph(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.baseUrl}/graph${queryString ? `?${queryString}` : ''}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
  }

  async syncGraph() {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error syncing graph:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Operation failed');
    }
    return data;
  }
}

export default new RecommendationService();