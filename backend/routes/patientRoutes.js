const express = require('express');
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const { verifyToken, requireWorker } = require('../middleware/auth');

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
router.post('/', verifyToken, requireWorker, upload.single('photo'), async (req, res) => {
    try {
        const {
            fullName, dateOfBirth, age, husbandName, phone,
            addressVillage, addressDistrict, addressState, addressPincode,
            aadhaar, lmpDate, edd, bloodGroup, gravida, para
        } = req.body;

        // Validate required fields
        if (!fullName || !dateOfBirth || !age || !husbandName || !phone || !addressVillage || !addressDistrict || !addressState || !addressPincode || !aadhaar || !lmpDate || !edd || !bloodGroup || gravida === undefined || para === undefined) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Validate phone (Indian mobile: starts with 6-9, exactly 10 digits)
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Phone number must be a valid 10-digit Indian mobile number (starts with 6-9).' });
        }

        // Validate Aadhaar (exactly 12 digits, cannot start with 0 or 1)
        if (!/^[2-9]\d{11}$/.test(aadhaar)) {
            return res.status(400).json({ success: false, message: 'Aadhaar must be a valid 12-digit number (cannot start with 0 or 1).' });
        }

        // Validate Pincode (exactly 6 digits, cannot start with 0)
        if (!/^[1-9]\d{5}$/.test(addressPincode)) {
            return res.status(400).json({ success: false, message: 'Pincode must be a valid 6-digit code.' });
        }

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
                village: addressVillage,
                district: addressDistrict,
                state: addressState,
                pincode: addressPincode
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
