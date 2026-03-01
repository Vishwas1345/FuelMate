import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get summary for both customer and gas station
router.get('/summary', authenticate, analyticsController.getSummary.bind(analyticsController));

export default router;
