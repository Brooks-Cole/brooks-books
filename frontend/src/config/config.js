const config = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    wsUrl: 'ws://localhost:3001'
  },
  production: {
    apiUrl: 'https://brooks-books.onrender.com/api',
    wsUrl: 'wss://brooks-books.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
console.log('Current environment:', environment);
console.log('Using config:', config[environment]);

export default config[environment];