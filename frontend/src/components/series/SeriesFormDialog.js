// frontend/src/components/series/SeriesFormDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  Alert
} from '@mui/material';

const defaultFormData = {
  name: '',
  description: '',
  author: '',
  genres: [],
  books: []
};

const AVAILABLE_GENRES = [
  'Fantasy', 'Adventure', 'Mystery', 'Science Fiction', 
  'Historical', 'Educational', 'Fiction', 'Non-Fiction'
];

export const SeriesFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.author || !formData.description) {
        throw new Error('Please fill in all required fields');
      }
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create New Series' : 'Edit Series'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Series Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <Autocomplete
            multiple
            options={AVAILABLE_GENRES}
            value={formData.genres}
            onChange={(_, newValue) => setFormData({ ...formData, genres: newValue })}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Genres"
                margin="normal"
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'create' ? 'Create Series' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SeriesFormDialog;