// frontend/src/components/books/GutenbergImport.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Pagination
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import apiService from '../../services/apiService.js';
import GutenbergImportDialog from './GutenbergImportDialog.js';


function GutenbergImport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [importStatus, setImportStatus] = useState({});
  const [importDialog, setImportDialog] = useState({
    open: false,
    gutenbergBook: null,
    potentialMatches: []
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const data = await apiService.searchGutenbergBooks(searchTerm, page);
      setResults(data);
    } catch (err) {
      setError('Failed to search Gutenberg books');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (gutenbergId) => {
    setImporting(true);
    setImportStatus(prev => ({ ...prev, [gutenbergId]: 'importing' }));
    try {
      // First check for potential matches
      const response = await apiService.importGutenbergBook(gutenbergId);
      
      if (response.potentialMatches?.length > 0) {
        // Open dialog if potential matches found
        setImportDialog({
          open: true,
          gutenbergBook: response.gutenbergBook,
          potentialMatches: response.potentialMatches
        });
      } else {
        // No matches found, proceed with direct import
        await apiService.confirmGutenbergImport({
          gutenbergBook: response.gutenbergBook,
          shouldMerge: false
        });
        setImportStatus(prev => ({ ...prev, [gutenbergId]: 'success' }));
      }
    } catch (err) {
      setImportStatus(prev => ({ ...prev, [gutenbergId]: 'error' }));
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleImportConfirm = async (existingBookId) => {
    try {
      await apiService.confirmGutenbergImport({
        gutenbergBook: importDialog.gutenbergBook,
        existingBookId,
        shouldMerge: !!existingBookId
      });
      setImportStatus(prev => ({ ...prev, [importDialog.gutenbergBook.gutenbergId]: 'success' }));
      setImportDialog({ open: false, gutenbergBook: null, potentialMatches: [] });
    } catch (err) {
      console.error('Error confirming import:', err);
      setError('Failed to import book');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // Trigger new search with updated page
    apiService.searchGutenbergBooks(searchTerm, value)
      .then(data => setResults(data))
      .catch(err => {
        setError('Failed to fetch page');
        console.error(err);
      });
  };

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Import Books from Project Gutenberg
      </Typography>

      {/* Search Form */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search Gutenberg books"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={searching}
          InputProps={{
            endAdornment: (
              <Button 
                type="submit"
                disabled={searching || !searchTerm.trim()}
                startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                Search
              </Button>
            )
          }}
        />
        <GutenbergImportDialog
            open={importDialog.open}
            onClose={() => setImportDialog({ open: false, gutenbergBook: null, potentialMatches: [] })}
            gutenbergBook={importDialog.gutenbergBook}
            potentialMatches={importDialog.potentialMatches}
            onConfirm={handleImportConfirm}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results?.books && (
        <Grid container spacing={3}>
          {results.books.map((book) => (
            <Grid item xs={12} md={6} key={book.gutenbergId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {book.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    by {book.author}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    {book.genres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" paragraph>
                    {book.description}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Downloaded {book.downloadCount} times
                    </Typography>
                    
                    <Button
                      variant="contained"
                      startIcon={importStatus[book.gutenbergId] === 'importing' ? 
                        <CircularProgress size={20} /> : <AddIcon />}
                      onClick={() => handleImport(book.gutenbergId)}
                      disabled={importStatus[book.gutenbergId] === 'importing' || 
                              importStatus[book.gutenbergId] === 'success'}
                      color={importStatus[book.gutenbergId] === 'success' ? "success" : "primary"}
                    >
                      {importStatus[book.gutenbergId] === 'success' ? 'Imported' : 
                       importStatus[book.gutenbergId] === 'importing' ? 'Importing...' : 'Import'}
                    </Button>
                  </Box>

                  {importStatus[book.gutenbergId] === 'error' && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Failed to import book
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {results?.count > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(results.count / 32)} // Gutenberg API returns 32 items per page
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}

export default GutenbergImport;