import reviewService from '../services/reviewService.js';

class ReviewController {
    async getReviews(req, res) {
        try {
            const reviews = await reviewService.getApprovedReviews();
            res.json(reviews);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async createReview(req, res) {
        try {
            const newReview = await reviewService.createReview(req.body);
            res.status(201).json(newReview);
        } catch (err) {
            console.error("Review Error:", err);
            res.status(400).json({ message: err.message });
        }
    }
}

export default new ReviewController();
