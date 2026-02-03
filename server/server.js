import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';

import routes from './routes/index.route.js';
import connectDB from './lib/mongodb.js';
import logger from './utils/logger.js';
import passport from './config/passport.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));

app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Log all requests
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ message: 'FuelMate API is running 🚀' });
});

// All API routes
app.use('/api', routes);

app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Log Level: ${process.env.LOG_LEVEL || 'info'}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
