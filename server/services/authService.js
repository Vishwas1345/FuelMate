import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

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

    async register(userData) {
        const { email, password, name, role } = userData;

        logger.debug('Register service called', { email, name, role });

        // Validate input
        if (!email || !password || !name) {
            logger.warn('Registration validation failed: Missing fields', { email, name, hasPassword: !!password });
            const error = new Error('Please provide all required fields');
            error.code = 'MISSING_FIELDS';
            error.status = 400;
            throw error;
        }

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                logger.warn('Registration failed: User already exists', { email });
                const error = new Error('User already exists');
                error.code = 'USER_EXISTS';
                error.status = 400;
                throw error;
            }

            // Create new user
            const user = new User({
                email,
                password,
                name,
                role: role || 'customer'
            });

            await user.save();
            logger.info('User created in database', { userId: user._id, email: user.email });

            // Generate tokens
            const tokens = this.generateTokens(user);

            return { user, tokens };
        } catch (error) {
            // If it's our custom error, re-throw it
            if (error.code === 'USER_EXISTS' || error.code === 'MISSING_FIELDS') {
                throw error;
            }

            // Log unexpected errors
            logger.error('Unexpected error in register service', {
                error: error.message,
                stack: error.stack,
                email
            });
            throw error;
        }
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
        const user = await User.findOne({ email });
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
