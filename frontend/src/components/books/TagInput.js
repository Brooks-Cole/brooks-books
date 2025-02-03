// frontend/src/components/books/TagInput.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Chip,
  Autocomplete,
  TextField
} from '@mui/material';
import apiService from '../../services/apiService.js';

const TagInput = ({ book, onTagAdd }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
  if (book.tags) {
    setSelectedTags(book.tags);
  }

  const fetchTags = async () => {
    try {
      const data = await apiService.getAvailableTags();
      setAvailableTags(data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };
  
    fetchTags();
  }, [book.tags]);
  const handleTagChange = (event, newTags) => {
    setSelectedTags(newTags);
    onTagAdd(book._id, newTags);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Autocomplete
        multiple
        value={selectedTags}
        onChange={handleTagChange}
        options={availableTags}
        renderTags={(value, getTagProps) =>
          value.map((tag, index) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Tags"
            placeholder="Select tags"
            fullWidth
            size="small"
          />
        )}
        freeSolo // Allows adding new tags not in the list
      />
    </Box>
  );
};

export default TagInput;