// src/components/vocabulary/VocabularyManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from '../config/api.js';

const VocabularyManagement = () => {
  const [vocabularyWords, setVocabularyWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    console.log('VocabularyManagement component mounted');
    fetchVocabularyWords();
  }, []);

const fetchVocabularyWords = async () => {
  try {
    console.log('Fetching vocabulary words...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      setLoading(false);
      return;
    }

    const response = await api.getVocabulary();
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched vocabulary data:', data);
    setVocabularyWords(data);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
  } finally {
    setLoading(false);
  }
};

 const handleEditWord = async (updatedWord) => {
   try {
     const response = await api.updateVocabulary(updatedWord._id, updatedWord, {
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       }
     });
     
     if (response.ok) {
       fetchVocabularyWords();
       setOpenEditDialog(false);
       setEditingWord(null);
     }
   } catch (error) {
     console.error('Error updating word:', error);
   }
 };
 
 const handleDeleteWord = async (wordId) => {
   if (window.confirm('Are you sure you want to delete this word? This action cannot be undone.')) {
     try {
       const response = await api.deleteVocabulary(wordId, {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });
 
       if (response.ok) {
         fetchVocabularyWords();
       }
     } catch (error) {
       console.error('Error deleting word:', error);
     }
   }
 };

  return (
    <Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {vocabularyWords.map((word) => (
            <Grid item xs={12} key={word._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Typography variant="h6" sx={{ mb: 1 }}>{word.word}</Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Book: {word.bookId?.title || 'Unknown Book'}
                      </Typography>
                      
                      {word.etymology && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary">Etymology:</Typography>
                          <Typography variant="body2">
                            Root: {word.etymology.root}<br />
                            Origin: {word.etymology.originLanguage}<br />
                            Meaning: {word.etymology.meaning}
                          </Typography>
                        </Box>
                      )}

                      {word.translations && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary">Translations:</Typography>
                          {Object.entries(word.translations).map(([lang, translation]) => (
                            <Typography key={lang} variant="body2">
                              {lang.toUpperCase()}: {translation}
                            </Typography>
                          ))}
                        </Box>
                      )}

                      {word.context && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary">Context:</Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{word.context.passage}"
                          </Typography>
                        </Box>
                      )}
                    </div>
                    <Box>
                      <IconButton 
                        onClick={() => {
                          setEditingWord(word);
                          setOpenEditDialog(true);
                        }}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteWord(word._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Word</DialogTitle>
        <DialogContent>
          {editingWord && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Word"
                value={editingWord.word}
                onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                margin="normal"
              />
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Etymology</Typography>
              <TextField
                fullWidth
                label="Root"
                value={editingWord.etymology?.root || ''}
                onChange={(e) => setEditingWord({
                  ...editingWord,
                  etymology: { ...editingWord.etymology, root: e.target.value }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Origin Language"
                value={editingWord.etymology?.originLanguage || ''}
                onChange={(e) => setEditingWord({
                  ...editingWord,
                  etymology: { ...editingWord.etymology, originLanguage: e.target.value }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Original Meaning"
                value={editingWord.etymology?.meaning || ''}
                onChange={(e) => setEditingWord({
                  ...editingWord,
                  etymology: { ...editingWord.etymology, meaning: e.target.value }
                })}
                margin="normal"
              />

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Context</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Context Passage"
                value={editingWord.context?.passage || ''}
                onChange={(e) => setEditingWord({
                  ...editingWord,
                  context: { ...editingWord.context, passage: e.target.value }
                })}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={() => handleEditWord(editingWord)} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VocabularyManagement;