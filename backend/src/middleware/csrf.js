// backend/src/middleware/csrf.js
import csrf from 'csurf';

export const csrfProtection = csrf({ 
  cookie: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
});