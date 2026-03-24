const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Worker = require('../models/Worker');

const router = express.Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            console.log('❌ Admin login attempt failed: Missing username or password.');
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        console.log('✅ Validation successful for admin login request.');
        console.log('🔑 Admin login attempt:', username);
        // Case-insensitive find
        const admin = await Admin.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        
        if (!admin) {
            console.log('❌ LOGIN FAILED: Admin NOT found in DB:', username);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log('❌ LOGIN FAILED: Password Mismatch for:', username);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        console.log('✅ Admin login successful:', username);

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
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Worker Login
router.post('/worker/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

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
        console.error('Worker login error:', error);
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

    console.log(`🔍 Verification attempt: using ${authHeader ? 'Header' : 'Cookie'} token`);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token.' });
    }
});

module.exports = router;
