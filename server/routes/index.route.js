import express from 'express';
import authRoutes from './auth.js';
import orderRoutes from './orders.js';
import userRoutes from './users.js';
import reviewRoutes from './reviews.js';
import contactRoutes from './contact.js';
import chatRoutes from './chat.js';
import analyticsRoutes from './analytics.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/contact', contactRoutes);
router.use('/chat', chatRoutes);

// Protected routes (require authentication)
router.use('/orders', authenticate, orderRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

export default router;
