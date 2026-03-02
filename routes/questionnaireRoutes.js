const express = require('express');
const Questionnaire = require('../models/Questionnaire');
const Patient = require('../models/Patient');
const { verifyToken, requireWorker } = require('../middleware/auth');

const router = express.Router();

// Submit a questionnaire
router.post('/', verifyToken, requireWorker, async (req, res) => {
    try {
        const { patientId, answers } = req.body;

        if (!patientId || !answers) {
            return res.status(400).json({ success: false, message: 'Patient ID and answers are required.' });
        }

        // Verify patient exists and belongs to this worker
        const patient = await Patient.findOne({ _id: patientId, registeredBy: req.user.id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found.' });
        }

        const questionnaire = new Questionnaire({
            patient: patientId,
            submittedBy: req.user.id,
            answers
        });

        await questionnaire.save();
        res.status(201).json({ success: true, message: 'Questionnaire submitted successfully.', questionnaire });
    } catch (error) {
        console.error('Submit questionnaire error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get questionnaires for a patient
router.get('/patient/:patientId', verifyToken, requireWorker, async (req, res) => {
    try {
        const questionnaires = await Questionnaire.find({
            patient: req.params.patientId,
            submittedBy: req.user.id
        }).sort({ submittedAt: -1 });

        res.json({ success: true, questionnaires });
    } catch (error) {
        console.error('Get questionnaires error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get a single questionnaire by ID
router.get('/:id', verifyToken, requireWorker, async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findOne({
            _id: req.params.id,
            submittedBy: req.user.id
        }).populate('patient', 'fullName age phone aadhaar');

        if (!questionnaire) {
            return res.status(404).json({ success: false, message: 'Questionnaire not found.' });
        }

        res.json({ success: true, questionnaire });
    } catch (error) {
        console.error('Get questionnaire error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
