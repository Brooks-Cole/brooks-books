// frontend/src/components/books/GutenbergImportDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';

const GutenbergImportDialog = ({
  open,
  onClose,
  gutenbergBook,
  potentialMatches,
  onConfirm
}) => {
  const [selectedBookId, setSelectedBookId] = React.useState('new');

  const handleConfirm = () => {
    onConfirm(selectedBookId === 'new' ? null : selectedBookId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Book from Gutenberg</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Gutenberg Book:</Typography>
          <Typography>Title: {gutenbergBook?.title}</Typography>
          <Typography>Author: {gutenbergBook?.author}</Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Similar books found in your library:
        </Typography>

        <RadioGroup
          value={selectedBookId}
          onChange={(e) => setSelectedBookId(e.target.value)}
        >
          <FormControlLabel
            value="new"
            control={<Radio />}
            label="Import as new book"
          />
          
          {potentialMatches?.map((book) => (
            <FormControlLabel
              key={book._id}
              value={book._id}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">
                    {book.title} by {book.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Merge with this existing book
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GutenbergImportDialog;