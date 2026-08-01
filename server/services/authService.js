import crypto from 'crypto';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import mailService from './mailService.js';
import redis from '../lib/redis.js';

// OTP config
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

// Redis key helpers
const otpKey = (email) => `otp:${email.trim().toLowerCase()}`;

class AuthService {
    // ─── Token helpers ────────────────────────────────────────────────────────

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

    // ─── OTP helpers (Redis) ──────────────────────────────────────────────────

    /**
     * Generate a 6-digit OTP, bcrypt-hash it, and store it in Redis.
     * Key: otp:<email>  — hash fields: { hash, attempts }  — TTL: 10 min
     * Returns the plain OTP to be emailed.
     */
    async setOtp(email) {
        const otp = crypto.randomInt(100000, 1000000).toString();
        const hash = await bcrypt.hash(otp, 10);
        const key = otpKey(email);

        // Store as a Redis hash so we can increment attempts atomically
        await redis.hset(key, 'hash', hash, 'attempts', '0');
        await redis.expire(key, OTP_TTL_SECONDS);

        logger.debug('OTP stored in Redis', { key, ttl: OTP_TTL_SECONDS });
        return otp;
    }

    /**
     * Verify an OTP submitted by the user.
     * Throws structured errors that authController already handles.
     * Returns true on success and deletes the Redis key.
     */
    async verifyOtp(email, otp) {
        const key = otpKey(email);
        const data = await redis.hgetall(key);

        // Key missing → either never set or already expired
        if (!data || !data.hash) {
            const error = new Error('This code has expired. Request a new verification code.');
            error.code = 'OTP_EXPIRED';
            error.status = 400;
            throw error;
        }

        const attempts = parseInt(data.attempts, 10) || 0;

        if (attempts >= MAX_OTP_ATTEMPTS) {
            const error = new Error(
                'You have exceeded the maximum number of attempts. Use "Resend code" to get a new code and try again.'
            );
            error.code = 'OTP_MAX_ATTEMPTS';
            error.status = 403;
            throw error;
        }

        const ok = await bcrypt.compare(String(otp).trim(), data.hash);

        if (!ok) {
            const newAttempts = attempts + 1;
            await redis.hset(key, 'attempts', String(newAttempts));

            if (newAttempts >= MAX_OTP_ATTEMPTS) {
                const error = new Error(
                    'You have exceeded the maximum number of attempts. Use "Resend code" to get a new code and try again.'
                );
                error.code = 'OTP_MAX_ATTEMPTS';
                error.status = 403;
                throw error;
            }

            const left = MAX_OTP_ATTEMPTS - newAttempts;
            const err = new Error(`Invalid code. ${left} attempt(s) remaining.`);
            err.code = 'INVALID_OTP';
            err.status = 400;
            throw err;
        }

        // Success — delete key immediately (no need to wait for TTL)
        await redis.del(key);
        logger.debug('OTP verified and deleted from Redis', { key });
        return true;
    }

    // ─── Auth methods ─────────────────────────────────────────────────────────

    /**
     * Local signup: creates (or refreshes pending) user and emails OTP.
     * No JWT until verifyEmailOtp succeeds.
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

        try {
            let existingUser = await User.findOne({ email: normalizedEmail });

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

                // Refresh the pending user and resend OTP
                existingUser.name = name;
                existingUser.password = password;
                existingUser.role = role || existingUser.role || 'customer';
                await existingUser.save();

                const otp = await this.setOtp(normalizedEmail);
                await mailService.sendSignupOtpEmail(normalizedEmail, name, otp);

                logger.info('Pending user refreshed; OTP resent via Redis', {
                    userId: existingUser._id,
                    email: normalizedEmail,
                });
                return { requiresVerification: true, email: normalizedEmail, user: existingUser };
            }

            // Brand new user — no OTP fields needed on the document
            const user = new User({
                email: normalizedEmail,
                password,
                name,
                role: role || 'customer',
                authProvider: 'local',
                isEmailVerified: false,
            });
            await user.save();

            const otp = await this.setOtp(normalizedEmail);
            await mailService.sendSignupOtpEmail(normalizedEmail, name, otp);

            logger.info('User created; OTP sent via Redis', { userId: user._id, email: user.email });
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

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

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

        // Already verified — just sign them in
        if (user.isEmailVerified !== false) {
            const tokens = this.generateTokens(user);
            return { user, tokens, alreadyVerified: true };
        }

        // Delegate all OTP logic to Redis helper (throws on any failure)
        await this.verifyOtp(normalizedEmail, otp);

        // Mark user as verified in MongoDB
        user.isEmailVerified = true;
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

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // Silently succeed if user not found / not pending (don't leak account existence)
        if (!user || user.authProvider !== 'local' || user.isEmailVerified !== false) {
            return { ok: true };
        }

        const otp = await this.setOtp(normalizedEmail);
        await mailService.sendSignupOtpEmail(user.email, user.name, otp);

        logger.info('Signup OTP resent via Redis', { userId: user._id, email: user.email });
        return { ok: true };
    }

    async login(credentials) {
        const { email, password } = credentials;

        logger.debug('Login service called', { email });

        if (!email || !password) {
            logger.warn('Login validation failed: Missing credentials', { email, hasPassword: !!password });
            const error = new Error('Please provide email and password');
            error.code = 'MISSING_CREDENTIALS';
            error.status = 400;
            throw error;
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            logger.warn('Login failed: User not found', { email });
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            error.status = 401;
            throw error;
        }

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
        return { user, tokens: this.generateTokens(user) };
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
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                const error = new Error('User not found');
                error.code = 'USER_NOT_FOUND';
                error.status = 401;
                throw error;
            }

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
