// frontend/src/components/books/DrawingList.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import DrawingCard from '../DrawingCard.js';

const DrawingList = ({ drawings, bookId, onDrawingUpload }) => {
  if (!drawings || drawings.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Drawings ({drawings.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {drawings.map((drawing, index) => (
          <DrawingCard
            key={index}
            drawing={drawing}
            bookId={bookId}
            onRefresh={onDrawingUpload}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DrawingList;