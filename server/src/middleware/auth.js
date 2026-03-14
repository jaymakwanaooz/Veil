const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT from Authorization header.
 * Attaches req.user with the full user document.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token may be invalid.',
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error.',
        });
    }
};

/**
 * Authenticate Socket.IO connections via token in handshake auth.
 * Returns the user object or throws an error.
 */
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
};

module.exports = { authenticate, authenticateSocket };
