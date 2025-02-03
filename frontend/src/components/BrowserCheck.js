import React, { useEffect, useState } from 'react';
import { Alert } from '@mui/material';

const BrowserCheck = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if browser is Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isSafari || isIOS) {
      // Check Safari version
      const versionMatch = navigator.userAgent.match(/Version\/(\d+)/);
      const safariVersion = versionMatch ? parseInt(versionMatch[1]) : 0;
      
      setShowWarning(safariVersion < 14);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <Alert severity="warning" sx={{ margin: '16px' }}>
      For the best experience, please use a recent version of Chrome, Firefox, or Safari 14+
    </Alert>
  );
};

export default BrowserCheck;