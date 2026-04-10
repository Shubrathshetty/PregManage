const express = require('express');
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const { verifyToken, requireWorker } = require('../middleware/auth');
const { patientSchema } = require('../validators/patientSchema');
const validate = require('../middleware/validate');
const logger = require('../config/logger');

const router = express.Router();

// Configure multer for photo uploads (Fix #10: already has file type/size validation)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'patient-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpg, png, webp) are allowed.'));
    }
});

// Register a new patient
router.post('/', verifyToken, requireWorker, upload.single('photo'), validate(patientSchema), async (req, res) => {
    try {
        const {
            fullName, dateOfBirth, age, phone, address, lmpDate, edd, currentMonthOfPregnancy
        } = req.body;

        

        const patient = new Patient({
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            age: parseInt(age),
            phone,
            address: {
                street: address.street,
                taluk: address.taluk,
                district: address.district,
                state: address.state,
                pincode: address.pincode
            },
            lmpDate: new Date(lmpDate),
            edd: new Date(edd),
            currentMonthOfPregnancy: parseInt(currentMonthOfPregnancy),
            photo: req.file ? `/uploads/${req.file.filename}` : null,
            registeredBy: req.user.id
        });

        await patient.save();
        logger.info('Patient registered', { patientId: patient._id, worker: req.user.id });
        res.status(201).json({ success: true, message: 'Patient registered successfully.', patient });
    } catch (error) {
        logger.error('Register patient error', { error: error.message });
        
        res.status(500).json({ success: false, message: error.message || 'Server error.' });
    }
});

// Fix #6: Get all patients with pagination
router.get('/', verifyToken, requireWorker, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const filter = { registeredBy: req.user.id };
        const [patients, totalCount] = await Promise.all([
            Patient.find(filter).sort({ registeredAt: -1 }).skip(skip).limit(limit),
            Patient.countDocuments(filter)
        ]);

        res.json({
            success: true,
            patients,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        });
    } catch (error) {
        logger.error('Get patients error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Search patients by name or Aadhaar
router.get('/search', verifyToken, requireWorker, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required.' });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const filter = {
            registeredBy: req.user.id,
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                
                { phone: { $regex: query, $options: 'i' } }
            ]
        };

        const [patients, totalCount] = await Promise.all([
            Patient.find(filter).sort({ registeredAt: -1 }).skip(skip).limit(limit),
            Patient.countDocuments(filter)
        ]);

        res.json({ success: true, patients, page, limit, totalPages: Math.ceil(totalCount / limit), totalCount });
    } catch (error) {
        logger.error('Search patients error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get single patient
router.get('/:id', verifyToken, requireWorker, async (req, res) => {
    try {
        const patient = await Patient.findOne({ _id: req.params.id, registeredBy: req.user.id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found.' });
        }
        res.json({ success: true, patient });
    } catch (error) {
        logger.error('Get patient error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update a patient
router.put('/:id', verifyToken, requireWorker, upload.single('photo'), validate(patientSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fullName, dateOfBirth, age, phone, address, lmpDate, edd, currentMonthOfPregnancy
        } = req.body;

        const patient = await Patient.findOne({ _id: id, registeredBy: req.user.id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found.' });
        }

        

        // Update fields
        patient.fullName = fullName;
        patient.dateOfBirth = new Date(dateOfBirth);
        patient.age = parseInt(age);
        patient.phone = phone;
        patient.address = {
            street: address.street,
            taluk: address.taluk,
            district: address.district,
            state: address.state,
            pincode: address.pincode
        };
        patient.lmpDate = new Date(lmpDate);
        patient.edd = new Date(edd);
        patient.currentMonthOfPregnancy = parseInt(currentMonthOfPregnancy);
        if (req.file) {
            // Delete old photo if it exists
            if (patient.photo) {
                const fs = require('fs');
                const oldPath = path.join(__dirname, '..', patient.photo);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            patient.photo = `/uploads/${req.file.filename}`;
        }

        await patient.save();
        logger.info('Patient updated', { patientId: id, worker: req.user.id });
        res.json({ success: true, message: 'Patient updated successfully.', patient });
    } catch (error) {
        logger.error('Update patient error', { error: error.message });
        res.status(500).json({ success: false, message: error.message || 'Server error.' });
    }
});

module.exports = router;
