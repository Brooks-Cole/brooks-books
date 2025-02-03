import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import DrawingCard from '../components/DrawingCard.js';
import config from '../config/config.js';

function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const url = `${config.apiUrl}/books/${bookId}`; // Construct the URL ONCE
      console.log("Fetching book details from:", url); // Log the URL
      const response = await fetch(url); // Use the url variable in fetch
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Book not found: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setBook(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);


  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Book not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {book.title}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          by {book.author}
        </Typography>


        {book.seriesName && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle1" color="primary">
              Part of series: {book.seriesName}
            </Typography>
          </Box>
        )}

        <Box sx={{ my: 2 }}>
          {book.genres?.map((genre) => (
            <Chip
              key={genre}
              label={genre}
              sx={{ mr: 1, mb: 1 }}
              variant="outlined"
            />
          ))}
        </Box>

        <Typography variant="body1" paragraph>
          {book.description}
        </Typography>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Drawings
        </Typography>
        <Grid container spacing={2}>
          {book.drawings?.map((drawing, index) => (
            <Grid item xs={12} md={6} key={index}>
              <DrawingCard
                drawing={drawing}
                bookId={book._id}
                onLikeUpdate={fetchBookDetails} // Now this will work
              />
            </Grid>
          ))}
          {!book.drawings?.length && (
            <Grid item xs={12}>
              <Typography color="textSecondary">
                No drawings yet for this book.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default BookDetail;