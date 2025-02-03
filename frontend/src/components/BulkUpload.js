// frontend/src/components/BulkUpload.js
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert,
  CircularProgress,
  Paper 
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import api from '../config/api.js';
import config from '../config/config.js';

function BulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
  
    const formData = new FormData();
    formData.append('bookList', file); // Make sure this matches your backend
    setUploading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to upload books');
      }
  
      const response = await fetch(`${config.apiUrl}/books/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      const data = await response.json();
      setSuccess(true);
      event.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload books');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Bulk Upload Books
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload an Excel file containing book information. The file should include columns for:
          title, author, description, genres (comma-separated), and age range.
        </Typography>
        
        <Button
          variant="contained"
          component="label"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          disabled={uploading}
          sx={{ mt: 2 }}
        >
          Upload Excel File
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Books uploaded successfully!
        </Alert>
      )}
    </Paper>
  );
}

export default BulkUpload;