import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Alert,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import apiService from '../../services/apiService.js';

const BookSelectionDialog = ({ open, onClose, onSelect, existingBookIds = [] }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedBooks, setSelectedBooks] = useState(new Set());

  useEffect(() => {
    if (open) {
      fetchBooks();
      setSelectedBooks(new Set()); // Reset selections when dialog opens
    }
  }, [open]);

  const fetchBooks = async () => {
    try {
      console.log('Fetching books...');
      setLoading(true);
      console.log('Requesting all books...');
      // Explicitly request all books with no limit
      const response = await apiService.getAllBooks(1, 'all');
      console.log('Raw API response:', response);

      if (!response || !response.books) {
        throw new Error('Invalid response format');
      }

      const allBooks = response.books;
      console.log('Books array:', allBooks);

      // Filter out existing books
      const availableBooks = allBooks.filter(book => 
        !existingBookIds.includes(book._id)
      );
      console.log('Available books:', availableBooks);
      
      setBooks(availableBooks);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBook = (bookId) => {
    setSelectedBooks(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(bookId)) {
        newSelected.delete(bookId);
      } else {
        newSelected.add(bookId);
      }
      return newSelected;
    });
  };

  const handleAddSelected = () => {
    const selectedBookObjects = books.filter(book => 
      selectedBooks.has(book._id)
    );
    onSelect(selectedBookObjects);
    onClose();
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Books to Series</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          margin="normal"
        />
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <ListItem 
                  key={book._id}
                  dense
                  button
                  onClick={() => handleToggleBook(book._id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedBooks.has(book._id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={book.title}
                    secondary={`by ${book.author}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary={
                  searchTerm 
                    ? "No matching books found" 
                    : "No available books to add"
                } />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleAddSelected}
          disabled={selectedBooks.size === 0}
          variant="contained"
          color="primary"
        >
          Add Selected Books ({selectedBooks.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookSelectionDialog;