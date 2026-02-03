import { Router } from 'express';
const router = Router();
import { register, login, getProfile, refreshToken, logout } from '../controllers/authController.js';
import { googleAuth, googleCallback } from '../controllers/oauthController.js';
import { authenticate } from '../middleware/auth.js';

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router; 