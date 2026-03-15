import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class MailService {
    constructor() {
        this.adminEmail = 'vishwastiwari1901@gmail.com';
        this.transporter = null;
        this.init();
    }

    init() {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            logger.info('Mail service initialized');
        } else {
            logger.warn('Email credentials missing - mail service in limited mode');
        }
    }

    async sendEmail(options) {
        if (!this.transporter) {
            logger.warn('Email skipped: Transporter not initialized');
            return;
        }

        try {
            const info = await this.transporter.sendMail(options);
            logger.debug('Email sent', { messageId: info.messageId, to: options.to });
            return info;
        } catch (error) {
            logger.error('Email sending failed', { error: error.message, to: options.to });
            // Don't throw to avoid breaking main workflow
        }
    }

    // ─── SCENARIO 1: REVIEWS ────────────────────────────────────────────────
    async sendReviewAcknowledgment(email, name, comment) {
        if (!email) return;
        
        const mailOptions = {
            from: `"Vishwas from FuelMate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank You for Your Feedback on FuelMate! ⛽',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #0f172a; padding: 20px; text-align: center;">
                        <h2 style="color: #f97316; margin: 0; font-size: 24px;">Greetings! 👋</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px;">Hi ${name || 'there'},</p>
                        <p>Thank you so much for taking the time to share your experience with us. We truly value your feedback as it helps us improve our service every day.</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #64748b; font-size: 12px;">YOU WROTE:</p>
                            <p style="font-style: italic; margin: 5px 0 0 0;">"${comment}"</p>
                        </div>
                        <p>If you have any further suggestions, feel free to reach out directly.</p>
                        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 0; font-weight: bold;">Vishwas Tiwari</p>
                            <p style="margin: 0; font-size: 12px; color: #64748b;">Founder, FuelMate</p>
                        </div>
                    </div>
                </div>
            `
        };
        return this.sendEmail(mailOptions);
    }

    // ─── SCENARIO 2: CONTACT SUPPORT ────────────────────────────────────────
    async sendSupportAcknowledgment(email, name, subject) {
        if (!email) return;

        const mailOptions = {
            from: `"Vishwas from FuelMate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `We've received your request: ${subject} ⛽`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #0f172a; padding: 20px; text-align: center;">
                        <h2 style="color: #f97316; margin: 0; font-size: 24px;">Support Received 🛠️</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; font-weight: bold;">Hi ${name},</p>
                        <p>This is a quick confirmation that we have received your support request regarding "<strong>${subject}</strong>".</p>
                        <p>Our team is reviewing your inquiry and will work on it immediately. You can expect a response shortly.</p>
                        <p>If you have any urgent updates, just reply to this email.</p>
                        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            <p style="margin: 0; font-weight: bold;">Best regards,</p>
                            <p style="margin: 0;">Vishwas Tiwari</p>
                        </div>
                    </div>
                </div>
            `
        };
        return this.sendEmail(mailOptions);
    }

    async sendAdminSupportNotification(name, email, subject, message) {
        const mailOptions = {
            from: `"${name} via FuelMate" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: this.adminEmail,
            subject: `Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #f97316; border-radius: 8px; padding: 20px;">
                    <h2 style="color: #f97316;">New Support Request</h2>
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr/>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8fafc; padding: 15px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
                </div>
            `
        };
        return this.sendEmail(mailOptions);
    }

    // ─── SCENARIO 3: SIGNUP ─────────────────────────────────────────────────
    async sendWelcomeEmail(email, name) {
        if (!email) return;

        const mailOptions = {
            from: `"Vishwas from FuelMate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to the FuelMate Family! ⛽✨',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(to right, #0f172a, #1e293b); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #f97316; margin: 0; font-size: 28px; letter-spacing: -1px;">Welcome to FuelMate!</h1>
                        <p style="color: #94a3b8; margin-top: 10px;">The future of fuel delivery is here.</p>
                    </div>
                    <div style="padding: 40px;">
                        <p style="font-size: 18px; font-weight: bold; color: #0f172a;">Congratulations ${name},</p>
                        <p style="line-height: 1.6; font-size: 16px;">We are thrilled to have you join us! FuelMate was built to save you time and make fuel delivery as easy as ordering food.</p>
                        
                        <div style="margin: 30px 0; padding: 25px; background: #fff7ed; border-radius: 16px; border: 1px solid #ffedd5;">
                            <h3 style="color: #c2410c; margin-top: 0;">What's next?</h3>
                            <ul style="padding-left: 20px; margin-bottom: 0;">
                                <li style="margin-bottom: 10px;">Set up your <strong>delivery addresses</strong></li>
                                <li style="margin-bottom: 10px;">Add your <strong>vehicles</strong> for quick orders</li>
                                <li>Place your <strong>first fuel order</strong> and see the magic!</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #f97316; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">Explore Dashboard</a>
                        </div>

                        <p style="margin-top: 40px; line-height: 1.6;">If you have any questions, I'm personally here to help. Just reply to this email!</p>
                        
                        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 25px;">
                            <p style="margin: 0; font-weight: bold; font-size: 16px;">Vishwas Tiwari</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b;">Founder, FuelMate</p>
                        </div>
                    </div>
                </div>
            `
        };
        return this.sendEmail(mailOptions);
    }

    async sendAdminSignupNotification(name, email, role, provider = 'email') {
        const mailOptions = {
            from: `"FuelMate System" <${process.env.EMAIL_USER}>`,
            to: this.adminEmail,
            subject: `🚨 New Signup: ${name}`,
            html: `
                <div style="font-family: 'Courier New', Courier, monospace; background: #000; color: #0f0; padding: 20px; border-radius: 8px; border: 1px solid #333;">
                    <h2 style="color: #0f0; border-bottom: 1px solid #333; padding-bottom: 10px;">[NEW_USER_EVENT]</h2>
                    <p style="margin: 10px 0;"><strong>NAME:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong>EMAIL:</strong> ${email}</p>
                    <p style="margin: 10px 0;"><strong>ROLE:</strong> ${role.toUpperCase()}</p>
                    <p style="margin: 10px 0;"><strong>METHOD:</strong> ${provider.toUpperCase()}</p>
                    <p style="margin: 10px 0;"><strong>TIME:</strong> ${new Date().toLocaleString()}</p>
                    <div style="margin-top: 20px; font-size: 10px; color: #666;">
                        This notification acts as your Slack-style alert on mail.
                    </div>
                </div>
            `
        };
        return this.sendEmail(mailOptions);
    }
}

export default new MailService();
