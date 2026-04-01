import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Get stations (public/protected)
router.get('/stations', userController.getStations);

// Toggle availability (Station only)
router.patch('/availability', userController.toggleAvailability);

// Get dashboard stats (Station only)
router.get('/dashboard-stats', userController.getDashboardStats);

// Update password (requires current password)
router.put('/password', userController.updatePassword);

// Delete account (self)
router.delete('/me', userController.deleteAccount);

export default router; 