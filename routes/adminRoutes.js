const express = require('express');
const Worker = require('../models/Worker');
const Questionnaire = require('../models/Questionnaire');
const Patient = require('../models/Patient');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a new Anganwadi worker
router.post('/workers', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, username, password, phone, area } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ success: false, message: 'Name, username, and password are required.' });
        }

        // Check if username already exists
        const existing = await Worker.findOne({ username });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }

        const worker = new Worker({
            name,
            username,
            password,
            phone,
            area,
            createdBy: req.user.id
        });

        await worker.save();
        res.status(201).json({
            success: true,
            message: 'Worker created successfully.',
            worker: { id: worker._id, name: worker.name, username: worker.username, phone: worker.phone, area: worker.area }
        });
    } catch (error) {
        console.error('Create worker error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all workers
router.get('/workers', verifyToken, requireAdmin, async (req, res) => {
    try {
        const workers = await Worker.find({}, '-password').sort({ createdAt: -1 });
        res.json({ success: true, workers });
    } catch (error) {
        console.error('Get workers error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get single worker
router.get('/workers/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id, '-password');
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found.' });
        }
        res.json({ success: true, worker });
    } catch (error) {
        console.error('Get worker error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update worker
router.put('/workers/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, phone, area, isActive, password } = req.body;
        const worker = await Worker.findById(req.params.id);

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found.' });
        }

        if (name) worker.name = name;
        if (phone !== undefined) worker.phone = phone;
        if (area !== undefined) worker.area = area;
        if (isActive !== undefined) worker.isActive = isActive;
        if (password) worker.password = password;

        await worker.save();
        res.json({
            success: true,
            message: 'Worker updated successfully.',
            worker: { id: worker._id, name: worker.name, username: worker.username, phone: worker.phone, area: worker.area, isActive: worker.isActive }
        });
    } catch (error) {
        console.error('Update worker error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Delete worker
router.delete('/workers/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found.' });
        }
        res.json({ success: true, message: 'Worker deleted successfully.' });
    } catch (error) {
        console.error('Delete worker error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all hospital visits
router.get('/hospital-visits', verifyToken, requireAdmin, async (req, res) => {
    try {
        const visits = await Questionnaire.find({ consultationType: 'hospital' })
            .populate('patient', 'fullName phone address')
            .populate('submittedBy', 'name area')
            .sort({ 'hospitalVisitDetails.date': 1, submittedAt: -1 });

        res.json({ success: true, visits });
    } catch (error) {
        console.error('Get hospital visits error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
