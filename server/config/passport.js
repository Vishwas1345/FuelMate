import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import mailService from '../services/mailService.js';

// Check if Google OAuth credentials are configured
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

// Debug logging
logger.info('Google OAuth Configuration Check:', {
    hasClientId: !!googleClientId,
    hasClientSecret: !!googleClientSecret,
    clientIdLength: googleClientId?.length,
    secretLength: googleClientSecret?.length,
    isPlaceholder: googleClientSecret === 'YOUR_GOOGLE_CLIENT_SECRET_HERE'
});

if (!googleClientId || !googleClientSecret || googleClientSecret === 'YOUR_GOOGLE_CLIENT_SECRET_HERE') {
    logger.warn('Google OAuth credentials not configured. Google sign-in will not be available.');
    logger.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
} else {
    // Only configure Google strategy if credentials are available
    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                logger.info('Google OAuth attempt', { email: profile.emails?.[0]?.value, googleId: profile.id });

                // Find user by Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Check if user exists with same email
                    const email = profile.emails?.[0]?.value;
                    if (email) {
                        user = await User.findOne({ email });

                        if (user) {
                            // Link Google account to existing user
                            user.googleId = profile.id;
                            user.authProvider = 'google';
                            user.isEmailVerified = true;
                            if (profile.photos?.[0]?.value) {
                                user.avatar = profile.photos[0].value;
                            }
                            await user.save();
                            logger.info('Linked Google account to existing user', { userId: user._id, email });
                        } else {
                            // Create new user
                            user = await User.create({
                                googleId: profile.id,
                                email: email,
                                name: profile.displayName || profile.name?.givenName || 'Google User',
                                authProvider: 'google',
                                avatar: profile.photos?.[0]?.value,
                                role: 'customer',
                                isEmailVerified: true,
                            });
                            logger.info('Created new user via Google OAuth', { userId: user._id, email });
                            
                            // Send notification emails
                            mailService.sendWelcomeEmail(user.email, user.name);
                            mailService.sendAdminSignupNotification(user.name, user.email, user.role, 'google');
                        }
                    } else {
                        throw new Error('No email provided by Google');
                    }
                } else {
                    logger.info('Existing Google user logged in', { userId: user._id, email: user.email });
                }

                return done(null, user);
            } catch (error) {
                logger.error('Google OAuth error', { error: error.message, stack: error.stack });
                return done(error, null);
            }
        }
    ));

    logger.info('Google OAuth strategy configured successfully');
}

export default passport;
