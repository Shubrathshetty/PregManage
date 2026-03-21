const express = require('express');
const Worker = require('../models/Worker');
const Questionnaire = require('../models/Questionnaire');
const Patient = require('../models/Patient');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { workerSchema } = require('../validators/workerSchema');
const validate = require('../middleware/validate');

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
        res.status(201).json({
            success: true,
            message: 'Worker created successfully.',
            worker: { id: worker._id, name: worker.name, username: worker.username, phone: worker.phone, address: worker.address, area: worker.area }
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
        res.json({
            success: true,
            message: 'Worker updated successfully.',
            worker: { id: worker._id, name: worker.name, username: worker.username, phone: worker.phone, address: worker.address, area: worker.area, isActive: worker.isActive }
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
            .sort({ submittedAt: 1 });

        res.json({ success: true, visits });
    } catch (error) {
        console.error('Get hospital visits error:', error);
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
        console.error('Get home visits error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all consultations (Needed & Completed)
router.get('/consultations', verifyToken, requireAdmin, async (req, res) => {
    try {
        const consultations = await Questionnaire.find({ doctorConsultation: true })
            .populate('patient') // Populate all patient fields for biodata view
            .populate('submittedBy', 'name')
            .sort({ submittedAt: 1 });

        res.json({ success: true, consultations });
    } catch (error) {
        console.error('Get consultations error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update consultation status
router.put('/consultations/:id/status', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const questionnaire = await Questionnaire.findById(req.params.id);

        if (!questionnaire) {
            return res.status(404).json({ success: false, message: 'Consultation record not found.' });
        }

        if (status === 'Completed' || status === 'Pending') {
            questionnaire.consultationStatus = status;
            if (status === 'Completed') {
                questionnaire.completedAt = new Date();
            } else {
                questionnaire.completedAt = null;
            }
            await questionnaire.save();
            return res.json({ success: true, message: `Consultation marked as ${status}.` });
        }

        res.status(400).json({ success: false, message: 'Invalid status.' });
    } catch (error) {
        console.error('Update consultation status error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
