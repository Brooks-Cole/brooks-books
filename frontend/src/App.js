// frontend/src/App.js
import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar.js';
import LoadingSpinner from './components/common/LoadingSpinner.js';
//import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import BookGallery from './pages/BookGallery.js';
import UserProfile from './pages/UserProfile.js';
import AdminDashboard from './pages/AdminDashboard.js';
import VocabularyPage from './pages/VocabularyPage.js';
import AboutPage from './pages/About.js';
import ContactPage from './pages/Contact.js';
import ResourcesPage from './pages/Resources.js';
import LittleLibraryPage from './pages/LittleLibrary.js';
import Discussions from './pages/Discussions.js';
import Treehouse from './pages/Treehouse.js';
import BookExplorer from './pages/BookExplorer.js';
import BookDetail from './pages/BookDetail.js';
import SeriesManagement from './pages/SeriesManagement.js';
//import MarketSimulator from './components/MarketSimulator';
import BrowserCheck from './components/BrowserCheck.js';
//import VocabularyQuiz from './components/vocabulary/VocabularyQuiz.jsx';
import QuizPage from './pages/QuizPage.js';
import { AuthProvider } from './context/AuthContext.js';


const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#2196f3',
      ...(mode === 'dark' && {
        main: '#90caf9',
      }),
    },
    secondary: {
      main: '#ff9800',
      ...(mode === 'dark' && {
        main: '#ffb74d',
      }),
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#fff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
  },
});

function App() {
  const [mode, setMode] = useState('dark');
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserCheck />
        <Router>
          <div className="App">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '.5vh' }}></div>
                <Navbar toggleTheme={toggleTheme} currentTheme={mode} />
                <div style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '64px' }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/books" element={<BookGallery />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/books/:bookId/vocabulary" element={<VocabularyPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/little-library" element={<LittleLibraryPage />} />
                    <Route path="/discussions" element={<Discussions />} />
                    <Route path="/treehouse" element={<Treehouse />} />
                    <Route path="/explore" element={<BookExplorer />} />
                    <Route path="/books/:bookId" element={<BookDetail />} />
                    <Route path="/series" element={<SeriesManagement />} />
                    <Route path="/books/:bookId/quiz" element={<QuizPage />} />
                    
                  </Routes>
                </div>
              </>
            )}
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;