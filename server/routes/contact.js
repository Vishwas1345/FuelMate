import express from 'express';
import mailService from '../services/mailService.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    logger.info('Contact form submission received', { email, subject, name });

    try {
        // Send both
        await Promise.all([
            mailService.sendAdminSupportNotification(name, email, subject, message),
            mailService.sendSupportAcknowledgment(email, name, subject)
        ]);

        logger.info('Contact emails processed successfully', { toAdmin: 'vishwastiwari1901@gmail.com', toUser: email, subject });
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        logger.error('Email sending failed', { error: error.message, stack: error.stack, from: req.body.email });
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

export default router;
