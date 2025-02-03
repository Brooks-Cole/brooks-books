// frontend/src/pages/SeriesManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Box,
  Chip,
//  Dialog,
//  DialogTitle,
//  DialogContent,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import seriesService from '../services/seriesService.js';
import SeriesFormDialog from '../components/series/SeriesFormDialog.js';
import SeriesBookForm from '../components/series/SeriesBookForm.js';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import BookSelectionDialog from '../components/series/BookSelectionDialog.js';
import config from '../config/config.js';

function SeriesManagement() {
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin] = useState(JSON.parse(localStorage.getItem('user'))?.isAdmin || false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [bookSelectionOpen, setBookSelectionOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const data = await seriesService.getAllSeries();
      setSeries(data);
    } catch (err) {
      setError('Failed to load series data');
      console.error('Error fetching series:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this series?')) {
      try {
        await seriesService.deleteSeries(id);
        await fetchSeries();
        setSelectedSeries(null);
      } catch (err) {
        setError('Failed to delete series');
      }
    }
  };

  const handleCreateSeries = async (seriesData) => {
    try {
      await seriesService.createSeries(seriesData);
      await fetchSeries();
    } catch (err) {
      setError('Failed to create series');
    }
  };
  
  const handleUpdateSeries = async (seriesData) => {
    try {
      await seriesService.updateSeries(editingSeries._id, seriesData);
      await fetchSeries();
      setEditingSeries(null);
    } catch (err) {
      setError('Failed to update series');
    }
  };
  
  const handleSaveBook = async (bookData) => {
    try {
      if (!selectedSeries) {
        setError('No series selected');
        return;
      }
  
      const updatedBooks = editingBook 
        ? selectedSeries.books.map(b => b.id === editingBook.id ? bookData : b)
        : [...selectedSeries.books, { ...bookData, id: Date.now().toString() }];
  
      const updatedSeries = {
        ...selectedSeries,
        books: updatedBooks
      };
  
      await seriesService.updateSeries(selectedSeries._id, updatedSeries);
      await fetchSeries();
      setBookFormOpen(false);
      setEditingBook(null);
    } catch (err) {
      console.error('Error saving book:', err);
      setError('Failed to save book');
    }
  };

  
  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookFormOpen(true);
  };

  const handleAddBook = async (selectedBooks) => {
    try {
      if (!selectedSeries) {
        console.error('No series selected');
        setError('Please select a series first');
        return;
      }
  
      console.log('Adding books to series:', {
        selectedBooks,
        seriesId: selectedSeries._id
      });
  
      const booksToAdd = selectedBooks.map(book => ({
        id: book._id,
        title: book.title,
        description: book.description,
        minAge: book.ageRange?.min || 8,
        maxAge: book.ageRange?.max || 15,
        tags: book.tags || []
      }));
  
      console.log('Formatted book data:', booksToAdd);
  
      const updatedSeries = {
        ...selectedSeries,
        books: [...selectedSeries.books, ...booksToAdd]
      };
  
      console.log('Updating series with:', updatedSeries);
  
      await seriesService.updateSeries(selectedSeries._id, updatedSeries);
      
      // Update local state immediately
      setSeries(prevSeries => 
        prevSeries.map(s => 
          s._id === selectedSeries._id ? updatedSeries : s
        )
      );
      setSelectedSeries(updatedSeries);
      
      setBookSelectionOpen(false);
    } catch (error) {
      console.error('Error adding books to series:', error);
      setError(error.message || 'Failed to add books to series');
    }
  };


  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          Book Series
        </Typography>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setFormDialogOpen(true)}
            >
              Add New Series
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={async () => {
                try {
                  setLoading(true);
                  const response = await fetch(`${config.apiUrl}/recommendations/sync`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (!response.ok) {
                    throw new Error('Sync failed');
                  }
                  
                  setSnackbar({
                    open: true,
                    message: 'Graph database synced successfully',
                    severity: 'success'
                  });
                } catch (error) {
                  console.error('Sync error:', error);
                  setSnackbar({
                    open: true,
                    message: 'Failed to sync graph database',
                    severity: 'error'
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              Sync Graph Database
            </Button>
          </Box>
        )}
      </Box>
  
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
  
      <Grid container spacing={3}>
        {series.map((seriesItem) => (
          <Grid item xs={12} md={6} key={seriesItem._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={() => setSelectedSeries(seriesItem)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {seriesItem.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  by {seriesItem.author}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {seriesItem.genres.map((genre) => (
                    <Chip 
                      key={genre} 
                      label={genre} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
  
                <Typography variant="body2" color="text.secondary">
                  {seriesItem.books.length} books in series
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
  
      <BookSelectionDialog
        open={bookSelectionOpen}
        onClose={() => setBookSelectionOpen(false)}
        onSelect={handleAddBook}
        existingBookIds={selectedSeries?.books.map(book => book.id) || []}
      />
  
      <Dialog
        open={Boolean(selectedSeries)}
        onClose={() => setSelectedSeries(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSeries && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedSeries.name}
                {isAdmin && (
                  <Box>
                    <Button 
                      color="primary"
                      onClick={() => {/* Add edit functionality */}}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      color="error"
                      onClick={() => handleDelete(selectedSeries._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedSeries.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Books in Series:
              </Typography>
              
              {isAdmin && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setBookSelectionOpen(true)}
                  sx={{ mb: 2 }} 
                >
                  Add Book to Series
                </Button>
              )}
              
              {selectedSeries.books.map((book) => (
                <Card key={book.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{book.title}</Typography>
                    <Typography variant="body2" paragraph>
                      {book.description}
                    </Typography>
                    <Box>
                      {book.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </DialogContent>
          </>
        )}
      </Dialog>
  
      <SeriesFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setEditingSeries(null);
        }}
        onSubmit={editingSeries ? handleUpdateSeries : handleCreateSeries}
        initialData={editingSeries}
        mode={editingSeries ? 'edit' : 'create'}
      />
      
      <SeriesBookForm
        open={bookFormOpen}
        onClose={() => {
          setBookFormOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        initialBook={editingBook}
      />
  
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SeriesManagement;