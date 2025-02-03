import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, 
  Grid, 
  Box,
  Alert,
  Snackbar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  TextField
} from '@mui/material';
import FilterBar from '../components/FilterBar.js';
import BookCard from '../components/books/BookCard.js';
import apiService from '../services/apiService.js';
import { useNavigate } from 'react-router-dom';

function BookGallery() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [expandedBooks, setExpandedBooks] = useState({});
  const [booksPerPage, setBooksPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = React.useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchBooks = useCallback(async () => {
    if (!searchTerm && !selectedGenre && !selectedTag && books.length > 0) {
      return;
    }
  
    try {
      setLoading(true);
      const response = await apiService.getAllBooks(page, booksPerPage, {
        search: searchTerm,
        genre: selectedGenre,
        tag: selectedTag
      });
  
      if (response?.books && Array.isArray(response.books)) {
        setBooks(response.books);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, [page, booksPerPage, searchTerm, selectedGenre, selectedTag, books.length]);

  useEffect(() => {
    let mounted = true;

    const loadBooks = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const response = await apiService.getAllBooks(page, booksPerPage, {
          search: searchTerm,
          genre: selectedGenre,
          tag: selectedTag
        });

        if (!mounted) return;

        if (response?.books && Array.isArray(response.books)) {
          setBooks(response.books);
          setTotalPages(response.totalPages || 1);
          setSuggestions(response.books.map(book => ({
            title: book.title,
            author: book.author
          })));
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Fetch error:', err);
        setError("Failed to load books.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    const debouncedLoad = setTimeout(loadBooks, searchTerm ? 500 : 0);

    return () => {
      mounted = false;
      clearTimeout(debouncedLoad);
    };
  }, [page, booksPerPage, searchTerm, selectedGenre, selectedTag]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(book => {
      const matchesSearch = !searchTerm || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !selectedGenre || book.genres.includes(selectedGenre);
      const matchesTag = !selectedTag || book.tags?.includes(selectedTag);
      return matchesSearch && matchesGenre && matchesTag;
    });
  }, [books, searchTerm, selectedGenre, selectedTag]);

  const handleDrawingUpload = async (bookId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await apiService.uploadDrawing(bookId, file);
      setSnackbar({
        open: true,
        message: 'Drawing uploaded successfully!',
        severity: 'success',
      });
      fetchBooks();
    } catch (err) {
      console.error('Upload error:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Error uploading drawing',
        severity: 'error',
      });
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    setExpandedBooks({});
  };

  const handleBooksPerPageChange = (event) => {
    setBooksPerPage(event.target.value);
    setPage(1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExpandBook = useCallback((bookId) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  }, []);

  const handleTagAdd = async (bookId, tags) => {
    try {
      await apiService.addTags(bookId, tags);
      fetchBooks();
    } catch (error) {
      console.error('Error adding tags:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add tags',
        severity: 'error',
      });
    }
  };

  if (loading && !books.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <FilterBar
        selectedGenre={selectedGenre}
        onGenreSelect={setSelectedGenre}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />
  
      <Box sx={{ mb: 4, position: 'sticky', top: 0, zIndex: 1, 
                 backgroundColor: 'background.default', pt: 2 }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          getOptionLabel={(option) => 
            typeof option === 'string' ? option : option.title
          }
          value={searchTerm}
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              setSearchTerm(newValue);
            } else if (newValue && newValue.title) {
              setSearchTerm(newValue.title);
            }
          }}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={searchInputRef}
              fullWidth
              label="Search books..."
              variant="outlined"
            />
          )}
        />
      </Box>
  
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Books per page</InputLabel>
          <Select
            value={booksPerPage}
            label="Books per page"
            onChange={handleBooksPerPageChange}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
  
      <Box sx={{ minHeight: loading ? '200px' : 'auto' }}>
        {filteredBooks.length > 0 ? (
          <>
            <Grid container spacing={4}>
              {filteredBooks.map((book) => (
                <Grid item xs={12} sm={6} md={4} key={book._id}>
                  <BookCard
                    book={book}
                    expanded={expandedBooks[book._id]}
                    onExpand={handleExpandBook}
                    onDrawingUpload={handleDrawingUpload}
                    onTagAdd={handleTagAdd}
                    handleUpload={(e) => handleDrawingUpload(book._id, e)}
                  />
                </Grid>
              ))}
            </Grid>
  
            <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 4 }}>
            No books found
          </Alert>
        )}
      </Box>
  
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default BookGallery;