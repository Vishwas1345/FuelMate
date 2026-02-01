import express from 'express';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    logger.info('Contact form submission received', { email, subject, name });

    try {
        // Check if credentials exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            logger.error('Email credentials missing in .env');
            return res.status(500).json({ message: 'Server configuration error: Missing email credentials.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Send FROM the auth user (Google requirement usually) but with user's name
            replyTo: email, // Reply to the user
            to: 'vishwastiwari1901@gmail.com',
            subject: `FuelMate Contact: ${subject}`,
            text: `
        You have received a new message from the FuelMate Contact Form.

        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
            html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Contact email sent successfully', { to: 'vishwastiwari1901@gmail.com', from: email, subject });
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        logger.error('Email sending failed', { error: error.message, stack: error.stack, from: req.body.email });
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

export default router;
