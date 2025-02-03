import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.js';
import config from '../config/config.js';
import apiService from '../services/apiService.js';

function Navbar({ toggleTheme, currentTheme }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthStatus = async () => {
    try {
      const data = await apiService.getProfile();
      setIsLoggedIn(true);
      setIsAdmin(data.isAdmin === true);
      // Store user data
      localStorage.setItem('user', JSON.stringify({
        isAdmin: data.isAdmin,
        username: data.username,
        id: data.id
      }));
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  // Check auth status when component mounts and when location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, [location.pathname]); // Re-check when route changes

  // Also check auth status when local storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        checkAuthStatus();
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Books', path: '/books' },
    { label: 'Explore', path: '/explore' },
    { label: 'Discussions', path: '/discussions' },
    { label: 'Treehouse', path: '/treehouse' },
    { label: 'Series', path: '/series' },
    ...(isLoggedIn ? [
      { label: 'Profile', path: '/profile' },
      ...(isAdmin ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
      { label: 'Logout', onClick: handleLogout }
    ] : [
      { label: 'Login', path: '/login' },
      { label: 'Register', path: '/register' }
    ])
  ];

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Brooks'Bookhouse
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <ThemeToggle currentTheme={currentTheme} toggleTheme={toggleTheme} />
          </Box>
          
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        navigate(item.path);
                        handleClose();
                      }
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            menuItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={item.onClick}
                component={item.path ? RouterLink : 'button'}
                to={item.path}
              >
                {item.label}
              </Button>
            ))
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;