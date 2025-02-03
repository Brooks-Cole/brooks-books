// frontend/src/components/FilterBar.js
import React, { useState, useEffect } from 'react';
import { Box, Chip, Paper, Typography, Divider, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import apiService from '../services/apiService.js';
import config from '../config/config.js';

const genres = [
  'All',
  'Adventure',
  'Fantasy',
  'Mystery',
  'Science',
  'Historical',
  'Educational',
  'Fiction',
  'Non-Fiction'
];

function FilterBar({ selectedGenre, onGenreSelect, selectedTag, onTagSelect }) {
  const [allTags, setAllTags] = useState([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  useEffect(() => {
      const fetchTags = async () => {
        try {
          const response = await fetch(`${config.apiUrl}/books/tags`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setAllTags(data.tags || []);
        } catch (error) {
          console.error('Error fetching tags:', error);
          setAllTags([]);
        }
      };
      fetchTags();
    }, []); // Empty dependency array - only fetch once
  

  const handleGenreSelect = (genre) => {
    onGenreSelect(genre === 'All' ? null : genre);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      {/* Genres Section */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Genres:</Typography>
      <Box sx={{
        display: 'flex',
        gap: 1,
        minWidth: 'min-content',
        mb: 2,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        {genres.map((genre) => (
          <Chip
            key={genre}
            label={genre}
            onClick={() => onGenreSelect(genre === 'All' ? null : genre)}
            color={selectedGenre === genre ? 'primary' : 'default'}
            variant={selectedGenre === genre ? 'filled' : 'outlined'}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 1
              }
            }}
          />
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Tags section with expand/collapse button */}
      {allTags.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Tags:</Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            >
              {isTagsExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Box sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            maxHeight: isTagsExpanded ? 'none' : '32px',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out'
          }}>
            {allTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                color={selectedTag === tag ? "primary" : "default"}
                variant={selectedTag === tag ? "filled" : "outlined"}
                size="small"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 1
                  }
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}

export default FilterBar;