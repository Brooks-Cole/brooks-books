// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Tab,
  Tabs,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete, Edit, Add, CloudUpload, Download } from '@mui/icons-material';
import { GENRES } from '../constants/bookConstants.js';
import BulkUpload from '../components/BulkUpload.js';
import { saveAs } from 'file-saver';
import VocabularyManagement from '../components/VocabularyManagement.jsx';
import config from '../config/config.js';
import Papa from 'papaparse';
import GutenbergImport from '../components/books/GutenbergImport.js';
import apiService from '../services/apiService.js';


function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [books, setBooks] = useState([]);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    genres: [],
    tags: [],
    tagInput: '',
    ageRange: { min: 8, max: 15 }
  });
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalDrawings: 0,
    activeUsers: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const suggestedSeries = (title) => {
    const seriesPatterns = [
      { regex: /Hardy Boys/i, name: 'The Hardy Boys Series' },
      { regex: /Redwall/i, name: 'Redwall Series' },
      { regex: /Chronicles of Narnia/i, name: 'The Chronicles of Narnia' },
      { regex: /Alex Rider/i, name: 'Alex Rider Series' },
      { regex: /(Book|Volume)\s+\d+/i, extractName: (title) => title.split(':')[0].trim() }
    ];
  
    for (const pattern of seriesPatterns) {
      if (pattern.regex.test(title)) {
        if (pattern.extractName) {
          return pattern.extractName(title);
        }
        return pattern.name;
      }
    }
  
    // Check for colon-based series titles
    if (title.includes(':')) {
      return title.split(':')[0].trim();
    }
  
    return null;
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching books...');
      const response = await apiService.getAllBooksNoLimit();
      if (response?.books && Array.isArray(response.books)) {
        console.log('Fetched books:', response.books);
        setBooks(response.books);
      } else {
        console.error('Invalid books data:', response);
        setBooks([]);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      if (!Array.isArray(books)) {
        console.error('Books is not an array:', books);
        return;
      }

      const statsData = {
        totalBooks: books.length,
        totalDrawings: books.reduce((sum, book) => sum + (Array.isArray(book.drawings) ? book.drawings.length : 0), 0),
        activeUsers: new Set(books.flatMap(book => 
          (Array.isArray(book.drawings) ? book.drawings.map(drawing => drawing.userId) : [])
        )).size,
        booksPerAgeGroup: books.reduce((acc, book) => {
          if (book?.ageRange) {
            const range = `${book.ageRange.min}-${book.ageRange.max}`;
            acc[range] = (acc[range] || 0) + 1;
          }
          return acc;
        }, {})
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, [books]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (Array.isArray(books) && books.length > 0) {
      fetchStats();
    }
  }, [books, fetchStats]);

  const fetchBooksForExport = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/books/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching books for export:', error);
      throw error;
    }
  };

  const handleExportBooks = async () => {
    try {
      const booksForExport = await fetchBooksForExport();
      console.log('Books fetched for export:', booksForExport);

      if (!Array.isArray(booksForExport)) {
        console.error('Books data is not an array:', booksForExport);
        throw new Error('Invalid books data format');
      }

      if (booksForExport.length === 0) {
        console.warn('No books to export');
        throw new Error('No books available to export');
      }

      const csvData = booksForExport.map(book => ({
        title: book.title || 'No Title',
        author: book.author || 'No Author',
        genres: Array.isArray(book.genres) ? book.genres.join(', ') : '',
        ageRange: book.ageRange ? `${book.ageRange.min}-${book.ageRange.max}` : '',
        description: book.description || '',
        tags: Array.isArray(book.tags) ? book.tags.join(', ') : '',
        totalDrawings: Array.isArray(book.drawings) ? book.drawings.length : 0
      }));

      console.log('CSV Data prepared:', csvData);

      const csv = Papa.unparse(csvData, {
        header: true,
        delimiter: ',',
        newline: '\n'
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `books_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      setError(`Failed to export books: ${error.message}`);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const existingTags = Array.isArray(bookFormData.tags) ? bookFormData.tags : [];
      const newTags = bookFormData.tagInput
        ? bookFormData.tagInput.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const suggestedSeries = (title) => {
        const seriesPatterns = [
          { regex: /Hardy Boys/i, name: 'The Hardy Boys Series' },
          { regex: /Redwall/i, name: 'Redwall Series' },
          { regex: /Chronicles of Narnia/i, name: 'The Chronicles of Narnia' },
          { regex: /Alex Rider/i, name: 'Alex Rider Series' },
          { regex: /(Book|Volume)\s+\d+/i, extractName: (title) => title.split(':')[0].trim() }
        ];
  
        for (const pattern of seriesPatterns) {
          if (pattern.regex.test(title)) {
            if (pattern.extractName) {
              return pattern.extractName(title);
            }
            return pattern.name;
          }
        }
  
        // Check for colon-based series titles
        if (title.includes(':')) {
          return title.split(':')[0].trim();
        }
  
        return null;
      };

      const allTags = [...new Set([...existingTags, ...newTags])];
      const dataToSend = {
        ...bookFormData,
        tags: allTags,
        series: suggestedSeries
      };
      delete dataToSend.tagInput;

      const url = selectedBook
        ? `${config.apiUrl}/books/${selectedBook._id}`
        : `${config.apiUrl}/books`;

      const response = await fetch(url, {
        method: selectedBook ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error('Failed to save book');
      }

      await fetchBooks();
      setOpenBookDialog(false);
      setSelectedBook(null);
      setBookFormData({
        title: '',
        author: '',
        description: '',
        genres: [],
        tags: [],
        tagInput: '',
        ageRange: { min: 8, max: 15 }
      });
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book: ' + error.message);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`${config.apiUrl}/books/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          fetchBooks();
        }
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleSyncGraph = async () => {
    try {
      setIsSyncing(true);
      console.log('Starting graph sync...');
      
      const response = await fetch(`${config.apiUrl}/recommendations/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sync completed:', data);
      setSnackbar({
        open: true,
        message: 'Graph sync completed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Sync error:', error);
      setSnackbar({
        open: true,
        message: `Failed to sync graph: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }
  
    if (error) {
      return (
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
            <Button onClick={fetchBooks} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        </Container>
      );
    }
  
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
  
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 4 }}>
          <Tab label="Books Management" />
          <Tab label="Statistics" />
          <Tab label="Content Moderation" />
          <Tab label="Vocabulary Management" />
          <Tab label="Bulk Upload" />
          <Tab label="Gutenberg Import" />
        </Tabs>
  
        {activeTab === 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setSelectedBook(null);
                  setBookFormData({
                    title: '',
                    author: '',
                    description: '',
                    ageRange: { min: 8, max: 15 }
                  });
                  setOpenBookDialog(true);
                }}
              >
                Add New Book
              </Button>
            </Box>
  
            {Array.isArray(books) && books.length > 0 ? (
              <Grid container spacing={3}>
                {books.map((book) => (
                  <Grid item xs={12} md={6} key={book._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <Typography variant="h6">{book.title}</Typography>
                            <Typography color="textSecondary">{book.author}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Age Range: {book.ageRange?.min}-{book.ageRange?.max}
                            </Typography>
                            <Typography variant="body2">
                              Drawings: {Array.isArray(book.drawings) ? book.drawings.length : 0}
                            </Typography>
                          </div>
                          <div>
                            <IconButton
                              onClick={() => {
                                setSelectedBook(book);
                                setBookFormData({
                                  title: book.title,
                                  author: book.author,
                                  description: book.description,
                                  genres: book.genres || [],
                                  tags: book.tags || [],
                                  ageRange: book.ageRange
                                });
                                setOpenBookDialog(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteBook(book._id)} color="error">
                              <Delete />
                            </IconButton>
                          </div>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h6">No books found</Typography>
                <Button
                  variant="contained"
                  onClick={() => setOpenBookDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Add Your First Book
                </Button>
              </Box>
            )}
          </>
        )}
  
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Platform Statistics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Books
                    </Typography>
                    <Typography variant="h4">{stats.totalBooks}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Drawings
                    </Typography>
                    <Typography variant="h4">{stats.totalDrawings}</Typography>
                  </CardContent>
                </Card>
              </Grid>
  
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Users
                    </Typography>
                    <Typography variant="h4">{stats.activeUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
  
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSyncGraph}
                disabled={isSyncing}
              >
                Sync Books to Graph Database
              </Button>
            </Box>
          </Box>
        )}
  
        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Content Moderation</Typography>
          </Box>
        )}
  
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>Vocabulary Management</Typography>
            <VocabularyManagement />
          </Box>
        )}
  
        {activeTab === 4 && (
          <>
            <BulkUpload />
            <Button 
              onClick={handleExportBooks}
              variant="contained" 
              startIcon={<Download />}
              sx={{ ml: 2 }}
            >
              Export Books
            </Button>
          </>
        )}

        {activeTab === 5 && (  // Adjust the index based on your existing tabs
          <GutenbergImport />
        )}
  
        <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleBookSubmit}>
            <DialogTitle>
              {selectedBook ? 'Edit Book' : 'Add New Book'}
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Title"
                value={bookFormData.title}
                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Author"
                value={bookFormData.author}
                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={bookFormData.description}
                onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
  
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" 
                gutterBottom>Genres</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {GENRES.map((genre) => (
                    <Chip
                      key={genre}
                      label={genre}
                      onClick={() => {
                        const currentGenres = bookFormData.genres || [];
                        if (currentGenres.includes(genre)) {
                          setBookFormData({
                            ...bookFormData,
                            genres: currentGenres.filter(g => g !== genre)
                          });
                        } else {
                          setBookFormData({
                            ...bookFormData,
                            genres: [...currentGenres, genre]
                          });
                        }
                      }}
                      color={bookFormData.genres?.includes(genre) ? "primary" : "default"}
                      variant={bookFormData.genres?.includes(genre) ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Box>
            
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Tags</Typography>
                <TextField
                  fullWidth
                  label="Add tags (comma-separated)"
                  value={bookFormData.tagInput || ''}
                  onChange={(e) => {
                    setBookFormData({
                      ...bookFormData,
                      tagInput: e.target.value
                    });
                  }}
                  helperText="Enter new tags separated by commas, they will be added when you save"
                />
                {bookFormData.tags && bookFormData.tags.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {bookFormData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => {
                          setBookFormData({
                            ...bookFormData,
                            tags: bookFormData.tags.filter((_, i) => i !== index)
                          });
                        }}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Box>
  
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Age Range</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Min Age"
                      type="number"
                      value={bookFormData.ageRange.min}
                      onChange={(e) => setBookFormData({
                        ...bookFormData,
                        ageRange: { ...bookFormData.ageRange, min: parseInt(e.target.value) }
                      })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Max Age"
                      type="number"
                      value={bookFormData.ageRange.max}
                      onChange={(e) => setBookFormData({
                        ...bookFormData,
                        ageRange: { ...bookFormData.ageRange, max: parseInt(e.target.value) }
                      })}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenBookDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {selectedBook ? 'Save Changes' : 'Add Book'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    );
  }
  
  export default AdminDashboard;