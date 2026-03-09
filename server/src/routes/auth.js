const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with username, password, and publicKey.
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, publicKey } = req.body;

        // Validation
        if (!username || !password || !publicKey) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and publicKey are required.',
            });
        }

        if (username.length < 3 || username.length > 24) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 3-24 characters.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.',
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken.',
            });
        }

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            password,
            publicKey,
        });

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: {
                token,
                user: user.toPublicJSON(),
            },
        });
    } catch (error) {
        console.error('Register error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration.',
        });
    }
});

/**
 * POST /api/auth/login
 * Login with username + password, returns JWT.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.',
            });
        }

        // Find user with password field included
        const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                token,
                user: user.toPublicJSON(),
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login.',
        });
    }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.toPublicJSON(),
        },
    });
});

/**
 * GET /api/auth/user/:userId/public-key
 * Get a user's public key (needed for E2EE).
 */
router.get('/user/:userId/public-key', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        res.json({
            success: true,
            data: {
                userId: user._id,
                publicKey: user.publicKey,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
});

module.exports = router;
