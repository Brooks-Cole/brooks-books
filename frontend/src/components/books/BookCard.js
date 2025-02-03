// frontend/src/components/books/BookCard.js
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Button
} from '@mui/material';
import { CloudUpload, ExpandLess, ExpandMore } from '@mui/icons-material';
import DrawingList from './DrawingList.js';
import TagInput from './TagInput.js';
import { Link } from 'react-router-dom';

const BookCard = ({ 
  book, 
  expanded, 
  onExpand, 
  onDrawingUpload,
  onTagAdd,
  handleUpload 
}) => {
  const getMostLikedDrawing = (drawings) => {
    if (!drawings || drawings.length === 0) return null;
    return drawings.reduce((mostLiked, current) => {
      const currentLikes = current.likes?.length || 0;
      const mostLikedCount = mostLiked.likes?.length || 0;
      return currentLikes > mostLikedCount ? current : mostLiked;
    }, drawings[0]);
  };

  const LearnVocabButton = ({ bookId }) => (
    <Button 
      component={Link} 
      to={`/books/${bookId}/vocabulary`}
      variant="contained"
      color="secondary"
      fullWidth
    >
      Learn New Vocab
    </Button>
  );
  
  const TakeQuizButton = ({ bookId }) => (
    <Button 
      component={Link} 
      to={`/books/${bookId}/quiz`}
      variant="contained"
      color="primary"
      fullWidth
      sx={{ mt: 1 }}
    >
      Take Quiz
    </Button>
  );

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        position: 'relative'
      }}
    >
      {/* Cover Image Section */}
      <Box
        onClick={() => onExpand(book._id)}
        sx={{ 
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <CoverImage book={book} getMostLikedDrawing={getMostLikedDrawing} />
        <ExpandButton expanded={expanded} />
      </Box>

      {/* Content Section */}
      <Box sx={{ p: 3 }}>
        <BookInfo book={book} />
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Action Buttons */}
            <UploadButton handleUpload={handleUpload} bookId={book._id} />
            <LearnVocabButton bookId={book._id} />
            <TakeQuizButton bookId={book._id} />
            

            {/* Tag Input */}
            <TagInput book={book} onTagAdd={onTagAdd} />

            {/* Drawings Section */}
            <DrawingList 
              drawings={book.drawings} 
              bookId={book._id}
              onDrawingUpload={onDrawingUpload}
            />
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

// Sub-components
const CoverImage = ({ book, getMostLikedDrawing }) => (
  book.drawings && book.drawings.length > 0 ? (
    <Box sx={{ 
      width: '100%', 
      height: 200, 
      overflow: 'hidden',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4
    }}>
      <img
        src={getMostLikedDrawing(book.drawings)?.imageUrl}
        alt={`Most liked drawing for ${book.title}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </Box>
  ) : (
    <Box sx={{
      width: '100%',
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.200',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4
    }}>
      <Typography variant="body2" color="text.secondary">
        No drawings yet
      </Typography>
    </Box>
  )
);

const ExpandButton = ({ expanded }) => (
  <IconButton 
    sx={{ 
      position: 'absolute', 
      bottom: 8, 
      right: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(4px)',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        transform: 'scale(1.1)'
      },
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}
  >
    {expanded ? <ExpandLess /> : <ExpandMore />}
  </IconButton>
);

const BookInfo = ({ book }) => (
  <>
    <Typography variant="h5" gutterBottom>
      {book.title}
    </Typography>
    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
      by {book.author}
    </Typography>
    {book.genres && (
      <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {book.genres.map((genre) => (
          <Chip
            key={genre}
            label={genre}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
              }
            }}
          />
        ))}
      </Box>
    )}
  </>
);

const UploadButton = ({ handleUpload, bookId }) => (
  <Button
    variant="contained"
    component="label"
    startIcon={<CloudUpload />}
    fullWidth
    sx={{
      borderRadius: '8px',
      textTransform: 'none',
      py: 1.5,
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
      '&:hover': {
        background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
      }
    }}
  >
    Upload Drawing
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={(e) => handleUpload(e)}
    />
  </Button>
);

const LearnVocabButton = ({ bookId }) => (
  <Button 
    component={Link} 
    to={`/books/${bookId}/vocabulary`}
    variant="contained"
    color="secondary"
    fullWidth
  >
    Learn New Vocab
  </Button>
);

export default BookCard;