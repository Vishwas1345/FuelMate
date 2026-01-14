import express from 'express';
import reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Get all approved reviews
router.get('/', reviewController.getReviews);

// Create a new review
router.post('/', reviewController.createReview);

export default router;
