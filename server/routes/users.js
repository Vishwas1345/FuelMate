import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

export default router; 