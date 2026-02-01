import reviewService from '../services/reviewService.js';
import logger from '../utils/logger.js';

class ReviewController {
    async getReviews(req, res) {
        try {
            logger.info('Fetching approved reviews');
            const reviews = await reviewService.getApprovedReviews();
            logger.info('Reviews fetched successfully', { count: reviews.length });
            res.json(reviews);
        } catch (err) {
            logger.error('Error fetching reviews', { error: err.message, stack: err.stack });
            res.status(500).json({ message: err.message });
        }
    }

    async createReview(req, res) {
        try {
            logger.info('Creating new review', { email: req.body.email, rating: req.body.rating });
            const newReview = await reviewService.createReview(req.body);
            logger.info('Review created successfully', { reviewId: newReview._id, status: newReview.status });
            res.status(201).json(newReview);
        } catch (err) {
            logger.error('Review creation error', { error: err.message, stack: err.stack, reviewData: req.body });
            res.status(400).json({ message: err.message });
        }
    }
}

export default new ReviewController();
