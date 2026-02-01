// controllers/authController.js
import authService from '../services/authService.js';
import logger from '../utils/logger.js';

// Set cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Register a new user
export const register = async (req, res) => {
    try {
        const { user, tokens } = await authService.register(req.body);

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        // Send response
        res.status(201).json({
            message: 'User registered successfully',
            token: tokens.accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Registration error', { error: error.message, stack: error.stack, body: req.body.email });
        res.status(error.status || 500).json({
            message: error.message || 'Error registering user',
            code: error.code || 'REGISTRATION_ERROR'
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { user, tokens } = await authService.login(req.body);

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        // Send response
        res.json({
            message: 'Login successful',
            token: tokens.accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Login error', { error: error.message, stack: error.stack, email: req.body.email });
        res.status(error.status || 500).json({
            message: error.message || 'Error logging in',
            code: error.code || 'LOGIN_ERROR'
        });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await authService.getProfile(req.user.id);
        res.json(user);
    } catch (error) {
        logger.error('Profile fetch error', { error: error.message, stack: error.stack, userId: req.user?.id });
        res.status(error.status || 500).json({
            message: error.message || 'Error fetching profile',
            code: error.code || 'PROFILE_ERROR'
        });
    }
};

// Refresh token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const tokens = await authService.refreshToken(refreshToken);

        // Set new refresh token
        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        // Send new access token
        res.json({
            token: tokens.accessToken
        });
    } catch (error) {
        logger.error('Token refresh error', { error: error.message, stack: error.stack });
        res.status(error.status || 401).json({
            message: error.message || 'Invalid refresh token',
            code: error.code || 'INVALID_REFRESH_TOKEN'
        });
    }
};

// Logout
export const logout = (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            ...cookieOptions,
            maxAge: 0
        });

        res.json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Logout error', { error: error.message, stack: error.stack });
        res.status(500).json({
            message: 'Error logging out',
            code: 'LOGOUT_ERROR'
        });
    }
};
