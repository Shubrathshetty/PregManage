const express = require('express');
const Worker = require('../models/Worker');
const Questionnaire = require('../models/Questionnaire');
const Patient = require('../models/Patient');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { workerSchema } = require('../validators/workerSchema');
const validate = require('../middleware/validate');
const logger = require('../config/logger');

const router = express.Router();

// Create a new Anganwadi worker
router.post('/workers', verifyToken, requireAdmin, validate(workerSchema), async (req, res) => {
    try {
        const { name, username, password, phone, address, area } = req.body;

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
            address: address ? {
                street: address.street,
                taluk: address.taluk,
                district: address.district,
                state: address.state,
                pincode: address.pincode
            } : undefined,
            area,
            createdBy: req.user.id
        });

        await worker.save();
        logger.info('Worker created', { workerId: worker._id, createdBy: req.user.id });
        res.status(201).json({
            success: true,
            message: 'Worker created successfully.',
            worker: { id: worker._id, name: worker.name, username: worker.username, phone: worker.phone, address: worker.address, area: worker.area }
        });
    } catch (error) {
        logger.error('Create worker error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all workers
router.get('/workers', verifyToken, requireAdmin, async (req, res) => {
    try {
        const workers = await Worker.find({}, '-password').sort({ createdAt: -1 });
        res.json({ success: true, workers });
    } catch (error) {
        logger.error('Get workers error', { error: error.message });
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
        logger.error('Get worker error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update worker
router.put('/workers/:id', verifyToken, requireAdmin, validate(workerSchema), async (req, res) => {
    try {
        const { name, phone, address, area, isActive, password } = req.body;
        const worker = await Worker.findById(req.params.id);

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found.' });
        }

        if (name) worker.name = name;
        if (phone !== undefined) worker.phone = phone;
        if (address) {
            worker.address = {
                street: address.street || worker.address?.street,
                taluk: address.taluk || worker.address?.taluk,
                district: address.district || worker.address?.district,
                state: address.state || worker.address?.state,
                pincode: address.pincode || worker.address?.pincode
            };
        }
        if (area !== undefined) worker.area = area;
        if (isActive !== undefined) worker.isActive = isActive;
        if (password) worker.password = password;

        await worker.save();
        logger.info('Worker updated', { workerId: worker._id, updatedBy: req.user.id });
        res.json({
            success: true,
            message: 'Worker updated successfully.',
            worker: { id: worker._id, name: worker.name, username: worker.username, phone: worker.phone, address: worker.address, area: worker.area, isActive: worker.isActive }
        });
    } catch (error) {
        logger.error('Update worker error', { error: error.message });
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
        logger.info('Worker deleted', { workerId: req.params.id, deletedBy: req.user.id });
        res.json({ success: true, message: 'Worker deleted successfully.' });
    } catch (error) {
        logger.error('Delete worker error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all hospital visits
router.get('/hospital-visits', verifyToken, requireAdmin, async (req, res) => {
    try {
        const visits = await Questionnaire.find({ consultationType: 'hospital' })
            .populate('patient', 'fullName phone address')
            .populate('submittedBy', 'name area')
            .sort({ submittedAt: 1 });

        res.json({ success: true, visits });
    } catch (error) {
        logger.error('Get hospital visits error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all home visits
router.get('/home-visits', verifyToken, requireAdmin, async (req, res) => {
    try {
        const visits = await Questionnaire.find({ consultationType: 'home' })
            .populate('patient', 'fullName phone address')
            .populate('submittedBy', 'name area')
            .sort({ submittedAt: 1 });

        res.json({ success: true, visits });
    } catch (error) {
        logger.error('Get home visits error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all consultations (Needed & Completed)
router.get('/consultations', verifyToken, requireAdmin, async (req, res) => {
    try {
        const consultations = await Questionnaire.find({ doctorConsultation: true })
            .populate('patient')
            .populate('submittedBy', 'name')
            .sort({ submittedAt: 1 });

        res.json({ success: true, consultations });
    } catch (error) {
        logger.error('Get consultations error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update consultation status
router.put('/consultations/:id/status', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (status !== 'Completed' && status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        const updateData = {
            consultationStatus: status,
            completedAt: status === 'Completed' ? new Date() : null
        };

        const result = await Questionnaire.updateOne(
            { _id: req.params.id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Consultation record not found.' });
        }

        logger.info('Consultation status updated', { consultationId: req.params.id, status });
        return res.json({ success: true, message: `Consultation marked as ${status}.` });
    } catch (error) {
        logger.error('Update consultation status error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
