import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import contactRoutes from './routes/contact.js';
import { authenticate } from './middleware/auth.js';
import connectDB from './lib/mongodb.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
  ],
  credentials: true
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ message: 'FuelMate API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

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
