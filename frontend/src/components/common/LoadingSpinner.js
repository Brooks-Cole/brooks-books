// frontend/src/components/common/LoadingSpinner.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 2
    }}
  >
    <CircularProgress />
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default LoadingSpinner;