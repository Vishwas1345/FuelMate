import express from 'express';
import reviewController from '../controllers/reviewController.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all approved general reviews
router.get('/', reviewController.getReviews);

// Create a new general review
router.post('/', reviewController.createReview);

// Station specific reviews
router.get('/station/:stationId', reviewController.getStationReviews);
router.post('/station/:stationId', authenticate, reviewController.createStationReview);

export default router;
