import reviewService from '../services/reviewService.js';
import logger from '../utils/logger.js';

class ReviewController {
    async getReviews(req, res) {
        try {
            const reviews = await reviewService.getApprovedReviews();
            res.json(reviews);
        } catch (err) {
            logger.error('Error fetching reviews', { error: err.message, stack: err.stack });
            res.status(500).json({ message: err.message });
        }
    }

    async createReview(req, res) {
        try {
            const newReview = await reviewService.createReview(req.body);
            res.status(201).json(newReview);
        } catch (err) {
            logger.error('Review creation error', { error: err.message, stack: err.stack, reviewData: req.body });
            res.status(400).json({ message: err.message });
        }
    }
}

export default new ReviewController();
