import Review from '../models/Review.js';
import nodemailer from 'nodemailer';
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
        const { comment, rating, userId } = reviewData;
        const review = new Review({
            userId,
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

    async sendAcknowledgmentEmail(email, message) {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: `"Vishwas from FuelMate" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Thank You for Your Feedback on FuelMate! ⛽',
                    text: `Greetings! Vishwas here from FuelMate,

Thank you so much for taking the time to share your experience with us. We truly value your feedback as it helps us improve our service every day.

We have received your review:
"${message}"

If you have any further suggestions or need assistance, feel free to reach out directly.

Best regards,

Vishwas Tiwari
Founder, FuelMate
vishwastiwari1901@gmail.com`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <h2 style="color: #ea580c;">Greetings! Vishwas here from FuelMate 👋</h2>
                            <p>Thank you so much for taking the time to share your experience with us. We truly value your feedback as it helps us improve our service every day.</p>
                            
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>You wrote:</strong></p>
                                <p style="font-style: italic;">"${message}"</p>
                            </div>

                            <p>If you have any further suggestions or need assistance, feel free to reach out directly.</p>
                            
                            <br/>
                            <p>Best regards,</p>
                            <p><strong>Vishwas Tiwari</strong><br/>
                            Founder, FuelMate<br/>
                            <a href="mailto:vishwastiwari1901@gmail.com" style="color: #ea580c;">vishwastiwari1901@gmail.com</a></p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                logger.info('Review acknowledgment email sent', { to: email });
            } catch (error) {
                logger.error('Email sending failed', { error: error.message, stack: error.stack, to: email });
                // We don't throw here to avoid failing the review creation just because email failed
            }
        }
    }
}

export default new ReviewService();
