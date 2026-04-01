import crypto from 'crypto';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import mailService from './mailService.js';

const OTP_TTL_MS = 15 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

class AuthService {
    // Helper: Generate tokens
    generateTokens(user) {
        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async setEmailVerificationOtp(user) {
        const otp = crypto.randomInt(100000, 1000000).toString();
        user.emailVerificationOtpHash = await bcrypt.hash(otp, 10);
        user.emailVerificationOtpExpires = new Date(Date.now() + OTP_TTL_MS);
        user.emailVerificationAttempts = 0;
        await user.save();
        return otp;
    }

    /**
     * Local signup: creates (or refreshes pending) user and emails OTP. No JWT until verifyEmailOtp.
     */
    async register(userData) {
        const { email, password, name, role } = userData;

        logger.debug('Register service called', { email, name, role });

        if (!email || !password || !name) {
            logger.warn('Registration validation failed: Missing fields', { email, name, hasPassword: !!password });
            const error = new Error('Please provide all required fields');
            error.code = 'MISSING_FIELDS';
            error.status = 400;
            throw error;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const secretSelect = '+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationAttempts';

        try {
            let existingUser = await User.findOne({ email: normalizedEmail }).select(secretSelect);
            if (existingUser) {
                const isPendingLocal =
                    existingUser.authProvider === 'local' && existingUser.isEmailVerified === false;
                if (!isPendingLocal) {
                    logger.warn('Registration failed: User already exists', { email });
                    const error = new Error('User already exists');
                    error.code = 'USER_EXISTS';
                    error.status = 400;
                    throw error;
                }
                existingUser.name = name;
                existingUser.password = password;
                existingUser.role = role || existingUser.role || 'customer';
                await existingUser.save();
                const otp = await this.setEmailVerificationOtp(existingUser);
                await mailService.sendSignupOtpEmail(normalizedEmail, name, otp);
                logger.info('Pending user refreshed; OTP resent', { userId: existingUser._id, email: normalizedEmail });
                return { requiresVerification: true, email: normalizedEmail, user: existingUser };
            }

            const user = new User({
                email: normalizedEmail,
                password,
                name,
                role: role || 'customer',
                authProvider: 'local',
                isEmailVerified: false,
            });
            await user.save();
            const full = await User.findById(user._id).select(secretSelect);
            const otp = await this.setEmailVerificationOtp(full);
            await mailService.sendSignupOtpEmail(normalizedEmail, name, otp);
            logger.info('User created; OTP sent', { userId: user._id, email: user.email });

            return { requiresVerification: true, email: normalizedEmail, user };
        } catch (error) {
            if (error.code === 'USER_EXISTS' || error.code === 'MISSING_FIELDS') {
                throw error;
            }
            logger.error('Unexpected error in register service', {
                error: error.message,
                stack: error.stack,
                email,
            });
            throw error;
        }
    }

    async verifyEmailOtp({ email, otp }) {
        if (!email || otp === undefined || otp === null || String(otp).trim() === '') {
            const error = new Error('Email and verification code are required');
            error.code = 'MISSING_FIELDS';
            error.status = 400;
            throw error;
        }

        const secretSelect = '+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationAttempts';
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select(secretSelect);

        if (!user) {
            const error = new Error('No account found for this email');
            error.code = 'USER_NOT_FOUND';
            error.status = 404;
            throw error;
        }

        if (user.authProvider !== 'local') {
            const error = new Error('This account uses a different sign-in method');
            error.code = 'NOT_LOCAL_ACCOUNT';
            error.status = 400;
            throw error;
        }

        if (user.isEmailVerified !== false) {
            const tokens = this.generateTokens(user);
            return { user, tokens, alreadyVerified: true };
        }

        if ((user.emailVerificationAttempts || 0) >= MAX_OTP_ATTEMPTS) {
            const error = new Error(
                'OTP verification failed. You have exceeded the maximum number of attempts. Use "Resend code" to get a new code and try again.',
            );
            error.code = 'OTP_MAX_ATTEMPTS';
            error.status = 403;
            throw error;
        }

        if (
            !user.emailVerificationOtpHash ||
            !user.emailVerificationOtpExpires ||
            new Date() > user.emailVerificationOtpExpires
        ) {
            const error = new Error('This code has expired. Request a new verification code.');
            error.code = 'OTP_EXPIRED';
            error.status = 400;
            throw error;
        }

        const ok = await bcrypt.compare(String(otp).trim(), user.emailVerificationOtpHash);
        if (!ok) {
            user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
            await user.save();

            if (user.emailVerificationAttempts >= MAX_OTP_ATTEMPTS) {
                const error = new Error(
                    'OTP verification failed. You have exceeded the maximum number of attempts. Use "Resend code" to get a new code and try again.',
                );
                error.code = 'OTP_MAX_ATTEMPTS';
                error.status = 403;
                throw error;
            }

            const left = MAX_OTP_ATTEMPTS - user.emailVerificationAttempts;
            const err = new Error(`Invalid code. ${left} attempt(s) remaining.`);
            err.code = 'INVALID_OTP';
            err.status = 400;
            throw err;
        }

        user.isEmailVerified = true;
        user.emailVerificationOtpHash = undefined;
        user.emailVerificationOtpExpires = undefined;
        user.emailVerificationAttempts = 0;
        await user.save();

        mailService.sendWelcomeEmail(user.email, user.name);
        mailService.sendAdminSignupNotification(user.name, user.email, user.role, 'email');

        const tokens = this.generateTokens(user);
        logger.info('Email verified', { userId: user._id, email: user.email });
        return { user, tokens };
    }

    async resendSignupOtp({ email }) {
        if (!email) {
            const error = new Error('Email is required');
            error.code = 'MISSING_FIELDS';
            error.status = 400;
            throw error;
        }

        const secretSelect = '+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationAttempts';
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select(secretSelect);

        if (!user || user.authProvider !== 'local' || user.isEmailVerified !== false) {
            return { ok: true };
        }

        const otp = await this.setEmailVerificationOtp(user);
        await mailService.sendSignupOtpEmail(user.email, user.name, otp);
        logger.info('Signup OTP resent', { userId: user._id, email: user.email });
        return { ok: true };
    }

    async login(credentials) {
        const { email, password } = credentials;

        logger.debug('Login service called', { email });

        // Validate input
        if (!email || !password) {
            logger.warn('Login validation failed: Missing credentials', { email, hasPassword: !!password });
            const error = new Error('Please provide email and password');
            error.code = 'MISSING_CREDENTIALS';
            error.status = 400;
            throw error;
        }

        // Find user
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            logger.warn('Login failed: User not found', { email });
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            error.status = 401;
            throw error;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn('Login failed: Invalid password', { email });
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            error.status = 401;
            throw error;
        }

        if (user.authProvider === 'local' && user.isEmailVerified === false) {
            const error = new Error(
                'Please verify your email before signing in. Check your inbox for the verification code.',
            );
            error.code = 'EMAIL_NOT_VERIFIED';
            error.status = 403;
            throw error;
        }

        logger.info('Login successful in service', { userId: user._id, email: user.email });

        // Generate tokens
        const tokens = this.generateTokens(user);

        return { user, tokens };
    }

    async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.code = 'USER_NOT_FOUND';
            error.status = 404;
            throw error;
        }
        return user;
    }

    async refreshToken(token) {
        if (!token) {
            const error = new Error('Refresh token not found');
            error.code = 'NO_REFRESH_TOKEN';
            error.status = 401;
            throw error;
        }

        try {
            // Verify refresh token
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                const error = new Error('User not found');
                error.code = 'USER_NOT_FOUND';
                error.status = 401;
                throw error;
            }

            // Generate new tokens
            return this.generateTokens(user);
        } catch (err) {
            if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                const error = new Error('Invalid refresh token');
                error.code = 'INVALID_REFRESH_TOKEN';
                error.status = 401;
                throw error;
            }
            throw err;
        }
    }
}

export default new AuthService();
