// frontend/src/services/seriesService.js
import config from '../config/config.js';

class SeriesService {
  constructor() {
    this.baseUrl = `${config.apiUrl}/series`;
    this.getHeaders = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  async getAllSeries() {
    try {
      const response = await fetch(this.baseUrl, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch series');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching series:', error);
      throw error;
    }
  }

  async createSeries(seriesData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(seriesData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating series:', error);
      throw error;
    }
  }

  async updateSeries(id, seriesData) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(seriesData)
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating series:', error);
      throw error;
    }
  }

  async deleteSeries(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting series:', error);
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

export default new SeriesService();