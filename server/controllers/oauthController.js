import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

// Cookie options (mirrors authController.js)
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return clientId && clientSecret && clientSecret !== 'YOUR_GOOGLE_CLIENT_SECRET_HERE';
};

// Initiate Google OAuth
export const googleAuth = (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        logger.warn('Google OAuth attempted but not configured');
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured on this server. Please contact the administrator.',
            error: 'oauth_not_configured'
        });
    }

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })(req, res, next);
};

// Handle Google OAuth callback
export const googleCallback = (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        logger.warn('Google OAuth callback attempted but not configured');
        const fe = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${fe}/auth/callback?error=oauth_not_configured`);
    }

    passport.authenticate('google', { session: false }, async (err, user, info) => {
        try {
            const fe = process.env.FRONTEND_URL || 'http://localhost:5173';

            if (err) {
                logger.error('Google OAuth authentication error', { error: err.message, stack: err.stack });
                return res.redirect(`${fe}/auth/callback?error=oauth_error`);
            }

            if (!user) {
                logger.warn('Google OAuth failed: No user returned', { info });
                return res.redirect(`${fe}/auth/callback?error=oauth_failed`);
            }

            // Generate JWT tokens
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

            logger.info('Google OAuth successful', {
                userId: user._id,
                email: user.email,
                authProvider: user.authProvider
            });

            // Set refresh token in HTTP-only cookie (same as regular login)
            res.cookie('refreshToken', refreshToken, cookieOptions);

            // Redirect to frontend with only the access token
            const redirectUrl = `${fe}/auth/callback?token=${accessToken}`;
            res.redirect(redirectUrl);
        } catch (error) {
            logger.error('Google OAuth callback error', { error: error.message, stack: error.stack });
            const fe = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${fe}/auth/callback?error=oauth_error`);
        }
    })(req, res, next);
};
