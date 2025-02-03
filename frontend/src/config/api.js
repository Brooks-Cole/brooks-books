const API_URL = process.env.REACT_APP_API_URL;

export const api = {
  async searchGifs(query) {
    const response = await fetch(`${API_URL}/gifs/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch GIFs');
    return response.json();
  },
  
  async getTrendingGifs() {
    const response = await fetch(`${API_URL}/gifs/trending`);
    if (!response.ok) throw new Error('Failed to fetch trending GIFs');
    return response.json();
  },

  // Add other API methods as needed
  async bulkUpload(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/books/bulk-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload books');
    return response.json();
  },

  async fetchAllBooks() {
    const response = await fetch(`${API_URL}/books?limit=all`);
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  },

  async uploadVocabulary(bookId, formData) {
    const response = await fetch(`${API_URL}/books/${bookId}/vocabulary/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload vocabulary');
    return response.json();
  },

  async getVocabulary() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/vocabulary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vocabulary');
    }

    return response;
  },

  async updateVocabulary(wordId, data) {
    const response = await fetch(`${API_URL}/vocabulary/${wordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update vocabulary');
    return response.json();
  },

  async deleteVocabulary(wordId) {
    const response = await fetch(`${API_URL}/vocabulary/${wordId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete vocabulary');
    return response.json();
  }
};

export default api;