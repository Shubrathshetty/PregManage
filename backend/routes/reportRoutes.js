const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// Submit a new report/feedback
router.post('/', async (req, res) => {
    try {
        const { identifier, subject, description } = req.body;

        if (!identifier || !subject || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields (Email/Phone, Subject, Description) are required.' 
            });
        }

        const report = new Report({
            identifier,
            subject,
            description
        });

        await report.save();

        res.status(201).json({ 
            success: true, 
            message: 'Your report has been submitted successfully. Thank you for your feedback!' 
        });
    } catch (error) {
        console.error('Report submission error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Admin can get all reports (optional for now, but good to have)
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
