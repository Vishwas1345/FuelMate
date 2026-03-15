import Review from '../models/Review.js';
import mailService from './mailService.js';
import logger from '../utils/logger.js';

class ReviewService {
    async getApprovedReviews() {
        return await Review.find({ isApproved: true, stationId: { $exists: false } })
            .sort({ createdAt: -1 })
            .limit(4);
    }

    async getStationReviews(stationId) {
        return await Review.find({ stationId, isApproved: true })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 });
    }

    async createReview(reviewData) {
        // This is for general site reviews
        const { comment, rating, userId, name, email } = reviewData;
        const review = new Review({
            userId,
            name,
            email,
            comment,
            rating: rating || 5
        });
        return await review.save();
    }

    async createStationReview(reviewData) {
        const { userId, stationId, comment, rating } = reviewData;
        const review = new Review({
            userId,
            stationId,
            comment,
            rating
        });
        return await review.save();
    }

    async sendAcknowledgmentEmail(email, name, message) {
        return await mailService.sendReviewAcknowledgment(email, name, message);
    }
}

export default new ReviewService();
