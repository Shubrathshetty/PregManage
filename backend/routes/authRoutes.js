const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Worker = require('../models/Worker');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/authSchema');
const logger = require('../config/logger');

const router = express.Router();

const { authLimiter } = require('../middleware/rateLimiter');

// Admin Login (Fix #2: validated with loginSchema)
router.post('/admin/login', authLimiter, validate(loginSchema), async (req, res) => {
    try {
        const { username, password } = req.body;

        logger.info('Admin login attempt', { username });

        // Case-insensitive find
        const admin = await Admin.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        
        if (!admin) {
            logger.warn('Admin login failed: user not found', { username });
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            logger.warn('Admin login failed: password mismatch', { username });
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        logger.info('Admin login successful', { username });

        const token = jwt.sign(
            { id: admin._id, username: admin.username, name: admin.name, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ success: true, message: 'Login successful.', token, user: { name: admin.name, role: 'admin' } });
    } catch (error) {
        logger.error('Admin login error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Worker Login (Fix #2: validated with loginSchema)
router.post('/worker/login', authLimiter, validate(loginSchema), async (req, res) => {
    try {
        const { username, password } = req.body;

        const worker = await Worker.findOne({ username, isActive: true });
        if (!worker) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or account is inactive.' });
        }

        const isMatch = await worker.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: worker._id, username: worker.username, name: worker.name, role: 'worker' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ success: true, message: 'Login successful.', token, user: { name: worker.name, role: 'worker' } });
    } catch (error) {
        logger.error('Worker login error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully.' });
});

// Verify token
router.get('/verify', (req, res) => {
    // Priority: Authorization header (sent by frontend) > Cookie
    const authHeader = req.headers.authorization?.split(' ')[1];
    const cookieToken = req.cookies?.token;
    const token = authHeader || cookieToken;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token found.' });
    }

    logger.debug(`Token verification: using ${authHeader ? 'Header' : 'Cookie'} token`);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token.' });
    }
});

module.exports = router;
