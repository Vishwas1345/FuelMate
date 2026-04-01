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

const authUserPayload = (user) => ({
    id: user._id,
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    isProfileComplete: user.isProfileComplete,
    avatar: user.avatar,
    isAvailable: user.isAvailable,
    fuelPrices: user.fuelPrices,
    isEmailVerified: user.isEmailVerified,
});

// Register a new user (local): sends OTP email; client must call POST /verify-email
export const register = async (req, res) => {
    try {
        logger.info('Registration attempt', { email: req.body.email, role: req.body.role });

        const result = await authService.register(req.body);

        if (result.requiresVerification) {
            logger.info('Registration pending email verification', { email: result.email });
            return res.status(201).json({
                message: 'We sent a verification code to your email.',
                requiresVerification: true,
                email: result.email,
            });
        }

        // Should not reach here; kept for forward compatibility
        const { user, tokens } = result;
        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
        res.status(201).json({
            message: 'User registered successfully',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: authUserPayload(user),
        });
    } catch (error) {
        logger.error('Registration error', { error: error.message, stack: error.stack, body: req.body.email });
        res.status(error.status || 500).json({
            message: error.message || 'Error registering user',
            code: error.code || 'REGISTRATION_ERROR'
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { user, tokens, alreadyVerified } = await authService.verifyEmailOtp(req.body);

        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        res.json({
            message: alreadyVerified ? 'Account already verified. Signed in.' : 'Email verified successfully',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: authUserPayload(user),
            alreadyVerified: !!alreadyVerified,
        });
    } catch (error) {
        logger.error('Verify email error', { error: error.message, email: req.body?.email });
        res.status(error.status || 500).json({
            message: error.message || 'Verification failed',
            code: error.code || 'VERIFY_ERROR',
        });
    }
};

export const resendSignupOtp = async (req, res) => {
    try {
        await authService.resendSignupOtp({ email: req.body.email });
        res.json({
            message: 'If this email has a pending account, we sent a new verification code.',
        });
    } catch (error) {
        logger.error('Resend OTP error', { error: error.message });
        res.status(error.status || 500).json({
            message: error.message || 'Could not resend code',
            code: error.code || 'RESEND_ERROR',
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        logger.info('Login attempt', { email: req.body.email });

        const { user, tokens } = await authService.login(req.body);

        logger.info('Login successful', { userId: user._id, email: user.email, role: user.role });

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        // Send response
        res.json({
            message: 'Login successful',
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: authUserPayload(user),
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
        logger.info('Fetching user profile', { userId: req.user.id });

        const user = await authService.getProfile(req.user.id);

        logger.info('Profile fetched successfully', { userId: req.user.id });
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
        logger.info('Token refresh attempt');

        // Prefer the HTTP-only cookie; fall back to the request body for clients
        // that stored the refresh token in localStorage (e.g. older Google OAuth sessions)
        const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;

        const tokens = await authService.refreshToken(refreshToken);

        logger.info('Token refreshed successfully');

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
        logger.info('Logout attempt');

        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            ...cookieOptions,
            maxAge: 0
        });

        logger.info('Logout successful');

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
