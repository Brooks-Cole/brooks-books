// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

// Import routes
import connectDB from '../config/database.js';
import authRouter from './routes/auth.js';
import bookRouter from './routes/books.js';
import translationRouter from './routes/translation.js';
import usersRouter from './routes/users.js';
import vocabularyRoutes from './routes/vocabulary.js';
import quizRoutes from './routes/quiz.js';
import gifsRouter from './routes/gifs.js';
import discussionsRouter from './routes/discussions.js';
import recommendationsRouter from './routes/recommendations.js';
import maintenanceRouter from './routes/maintenance.js';
import websocketService from './services/webSocketService.js';
import corsOptions from './config/cors.js';
import seriesRouter from './routes/series.js';
import graphRoutes from './routes/graphRoutes.js';
import { verifyGraphConnection } from './middleware/graphAuth.js';
import { handleGraphError } from './middleware/graphError.js';
import { connectNeo4j } from './config/neo4j.js';  // Change path to relative
import bookRoutes from './routes/books.js';


// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment setup
const env = process.env.NODE_ENV || 'development';
dotenv.config({ 
  path: path.join(__dirname, '..', '..', `.env.${env}`)
});

// Initialize express and create HTTP server
const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
websocketService.initialize(server);

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('/api/graph', verifyGraphConnection);

// Route Middlewares
app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gifs', gifsRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/translate', translationRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/series', seriesRouter);
app.use('/api', graphRoutes);

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.use(handleGraphError);

// Connect to database and start server
const PORT = process.env.PORT || 3001;

// Update startServer function
const startServer = async () => {
  try {
    await connectDB();
    await connectNeo4j();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();