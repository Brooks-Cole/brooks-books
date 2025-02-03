// frontend/src/components/series/SeriesBookForm.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const defaultBookData = {
  id: '',
  title: '',
  description: '',
  minAge: 8,
  maxAge: 15,
  tags: []
};

export const SeriesBookForm = ({
  open,
  onClose,
  onSave,
  initialBook = null
}) => {
  const [bookData, setBookData] = useState(initialBook || defaultBookData);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      setBookData({
        ...bookData,
        tags: [...bookData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {initialBook ? 'Edit Book' : 'Add Book to Series'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          value={bookData.title}
          onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Description"
          value={bookData.description}
          onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          required
        />

        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
          <TextField
            label="Min Age"
            type="number"
            value={bookData.minAge}
            onChange={(e) => setBookData({ ...bookData, minAge: parseInt(e.target.value) })}
            sx={{ width: '100px' }}
          />
          <TextField
            label="Max Age"
            type="number"
            value={bookData.maxAge}
            onChange={(e) => setBookData({ ...bookData, maxAge: parseInt(e.target.value) })}
            sx={{ width: '100px' }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <form onSubmit={handleAddTag}>
            <TextField
              fullWidth
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              helperText="Press Enter to add tag"
            />
          </form>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {bookData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => setBookData({
                  ...bookData,
                  tags: bookData.tags.filter((_, i) => i !== index)
                })}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => onSave(bookData)} 
          variant="contained" 
          color="primary"
        >
          Save Book
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeriesBookForm;