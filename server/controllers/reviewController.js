import reviewService from '../services/reviewService.js';
import logger from '../utils/logger.js';

class ReviewController {
    async getReviews(req, res) {
        try {
            logger.info('Fetching approved general reviews');
            const reviews = await reviewService.getApprovedReviews();
            res.json(reviews);
        } catch (err) {
            logger.error('Error fetching reviews', { error: err.message });
            res.status(500).json({ message: err.message });
        }
    }

    async getStationReviews(req, res) {
        try {
            const { stationId } = req.params;
            logger.info('Fetching station reviews', { stationId });
            const reviews = await reviewService.getStationReviews(stationId);
            res.json(reviews);
        } catch (err) {
            logger.error('Error fetching station reviews', { error: err.message });
            res.status(500).json({ message: err.message });
        }
    }

    async createReview(req, res) {
        try {
            logger.info('Creating general review', { userId: req.user?._id });
            const newReview = await reviewService.createReview({
                ...req.body,
                userId: req.user?._id
            });
            res.status(201).json(newReview);
        } catch (err) {
            logger.error('Review creation error', { error: err.message });
            res.status(400).json({ message: err.message });
        }
    }

    async createStationReview(req, res) {
        try {
            const { stationId } = req.params;
            logger.info('Creating station review', { stationId, userId: req.user?._id });
            const newReview = await reviewService.createStationReview({
                ...req.body,
                stationId,
                userId: req.user._id
            });
            res.status(201).json(newReview);
        } catch (err) {
            logger.error('Station review creation error', { error: err.message });
            res.status(400).json({ message: err.message });
        }
    }
}

export default new ReviewController();
