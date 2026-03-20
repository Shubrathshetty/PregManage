const express = require('express');
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const { verifyToken, requireWorker } = require('../middleware/auth');
const { patientSchema } = require('../validators/patientSchema');
const validate = require('../middleware/validate');

const router = express.Router();

// Configure multer for photo uploads
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
            fullName, dateOfBirth, age, husbandName, phone,
            address, // Reconstructed by validate middleware
            aadhaar, lmpDate, edd, bloodGroup, gravida, para
        } = req.body;

        // Check for duplicate Aadhaar
        const existingPatient = await Patient.findOne({ aadhaar });
        if (existingPatient) {
            return res.status(400).json({ success: false, message: 'A patient with this Aadhaar number already exists.' });
        }

        const patient = new Patient({
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            age: parseInt(age),
            husbandName,
            phone,
            address: {
                street: address.street,
                taluk: address.taluk,
                district: address.district,
                state: address.state,
                pincode: address.pincode
            },
            aadhaar,
            lmpDate: new Date(lmpDate),
            edd: new Date(edd),
            bloodGroup,
            gravida: parseInt(gravida),
            para: parseInt(para),
            photo: req.file ? `/uploads/${req.file.filename}` : null,
            registeredBy: req.user.id
        });

        await patient.save();
        res.status(201).json({ success: true, message: 'Patient registered successfully.', patient });
    } catch (error) {
        console.error('Register patient error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A patient with this Aadhaar number already exists.' });
        }
        res.status(500).json({ success: false, message: error.message || 'Server error.' });
    }
});

// Get all patients for the logged-in worker
router.get('/', verifyToken, requireWorker, async (req, res) => {
    try {
        const patients = await Patient.find({ registeredBy: req.user.id }).sort({ registeredAt: -1 });
        res.json({ success: true, patients });
    } catch (error) {
        console.error('Get patients error:', error);
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

        const patients = await Patient.find({
            registeredBy: req.user.id,
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { aadhaar: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        }).sort({ registeredAt: -1 });

        res.json({ success: true, patients });
    } catch (error) {
        console.error('Search patients error:', error);
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
        console.error('Get patient error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
