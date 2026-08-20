const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication Middleware
 * Verifies JWT token from request headers
 */
const authenticate = (req, res, next) => {
    try {
        // 1. Get token from Authorization header
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        // 2. Extract the token
        const token = authHeader.replace('Bearer ', '');

        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Add user info to request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userUsername = decoded.username;
        
        // 5. Continue to the next middleware/route
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token.' 
        });
    }
};

module.exports = authenticate;