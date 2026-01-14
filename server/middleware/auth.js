// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        // Check for token in different places
        const token = 
            req.headers.authorization?.split(' ')[1] || // Bearer token
            req.headers['x-access-token'] ||           // Custom header
            req.cookies?.token;                        // Cookie

        if (!token) {
            return res.status(401).json({ 
                message: 'Authentication required. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Set the full decoded user object including id
            req.user = {
                _id: decoded.id, // Ensure we have the _id field
                id: decoded.id,  // Also keep id for compatibility
                email: decoded.email,
                role: decoded.role
            };
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token has expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            return res.status(401).json({ 
                message: 'Invalid token. Please login again.',
                code: 'INVALID_TOKEN'
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            message: 'Internal server error during authentication',
            code: 'AUTH_ERROR'
        });
    }
};
