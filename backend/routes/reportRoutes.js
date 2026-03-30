const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const validate = require('../middleware/validate');
const { reportSchema } = require('../validators/reportSchema');
const logger = require('../config/logger');

// Submit a new report/feedback (Fix #2: validated with reportSchema)
router.post('/', validate(reportSchema), async (req, res) => {
    try {
        const { identifier, subject, description } = req.body;

        const report = new Report({
            identifier,
            subject,
            description
        });

        await report.save();
        logger.info('Report submitted', { reportId: report._id });

        res.status(201).json({ 
            success: true, 
            message: 'Your report has been submitted successfully. Thank you for your feedback!' 
        });
    } catch (error) {
        logger.error('Report submission error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Fix #6: Admin can get all reports with pagination
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [reports, totalCount] = await Promise.all([
            Report.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Report.countDocuments()
        ]);

        res.json({
            success: true,
            reports,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        });
    } catch (error) {
        logger.error('Get reports error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
