// frontend/src/services/apiService.js
import config from '../config/config.js';

class ApiService {
  constructor() {
    this.baseUrl = config.apiUrl;
    this.getHeaders = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    return data;
  }

  async login(credentials) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async getProfile() {
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfilePhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${this.baseUrl}/auth/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }


  async uploadDrawing(bookId, file) {
    const formData = new FormData();
    formData.append('drawing', file);

    const response = await fetch(`${this.baseUrl}/books/${bookId}/drawings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async likeDrawing(bookId, drawingId) {
    const response = await fetch(
      `${this.baseUrl}/books/${bookId}/drawings/${drawingId}/like`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    );
    return this.handleResponse(response);
  }

  async unlikeDrawing(bookId, drawingId) {
    const response = await fetch(
      `${this.baseUrl}/books/${bookId}/drawings/${drawingId}/unlike`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    );
    return this.handleResponse(response);
  }

  async addComment(bookId, drawingId, content) {
    const response = await fetch(
      `${this.baseUrl}/books/${bookId}/drawings/${drawingId}/comments`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content })
      }
    );
    return this.handleResponse(response);
  }

  async addTags(bookId, tags) {
    const response = await fetch(`${this.baseUrl}/books/${bookId}/tags`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tags })
    });
    return this.handleResponse(response);
  }

  async getProfileDrawings() {
    const response = await fetch(`${this.baseUrl}/auth/profile/drawings`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getDiscussions() {
    const response = await fetch(`${this.baseUrl}/discussions`);
    return this.handleResponse(response);
  }

  async createDiscussion(discussionData) {
    const response = await fetch(`${this.baseUrl}/discussions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(discussionData)
    });
    return this.handleResponse(response);
  }

  async addDiscussionComment(discussionId, content) {
    const response = await fetch(`${this.baseUrl}/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content })
    });
    return this.handleResponse(response);
  }

  async deleteDiscussion(discussionId) {
    const response = await fetch(`${this.baseUrl}/discussions/${discussionId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getBookQuiz(bookId) {
    const response = await fetch(`${this.baseUrl}/quiz/book/${bookId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }


  async submitQuizResults(bookId, score, totalQuestions) {
    const response = await fetch(`${this.baseUrl}/quiz/book/${bookId}/results`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ score, totalQuestions })
    });
    return this.handleResponse(response);
  }

  async getAllBooksNoLimit() {
    try {
      const response = await fetch(`${this.baseUrl}/books?limit=all`, {
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching all books:', error);
      throw error;
    }
  }

  async getAllBooks(page = 1, limit = 25, filters = {}) {
    try {
      const { search, genre, tag } = filters;
      let url = `${this.baseUrl}/books?page=${page}&limit=${limit}`;
      
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (genre) url += `&genre=${encodeURIComponent(genre)}`;
      if (tag) url += `&tag=${encodeURIComponent(tag)}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

async confirmGutenbergImport(data) {
  const response = await fetch(`${this.baseUrl}/books/gutenberg/confirm-import`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify(data)
  });
  return this.handleResponse(response);
}

async searchGutenbergBooks(query, page = 1) {
  try {
    const response = await fetch(
      `${this.baseUrl}/books/gutenberg/search?query=${encodeURIComponent(query)}&page=${page}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  } catch (error) {
    console.error('Error searching Gutenberg books:', error);
    throw error;
  }
}

async importGutenbergBook(gutenbergId) {
  try {
    const response = await fetch(
      `${this.baseUrl}/books/gutenberg/import/${gutenbergId}`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    );
    return this.handleResponse(response);
  } catch (error) {
    console.error('Error importing Gutenberg book:', error);
    throw error;
  }
}

async generateTags(bookId) {
  try {
    const response = await fetch(
      `${this.baseUrl}/books/${bookId}/generate-tags`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    );
    return this.handleResponse(response);
  } catch (error) {
    console.error('Error generating tags:', error);
    throw error;
  }
}

async getAvailableTags() {
  try {
    const response = await fetch(`${this.baseUrl}/books/available-tags`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

  async bulkUpload(formData) {
    const response = await fetch(`${this.baseUrl}/books/bulk-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }
}

const apiService = new ApiService();
export default apiService;