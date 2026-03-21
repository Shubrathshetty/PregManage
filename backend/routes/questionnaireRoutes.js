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

// Update doctor consultation for a questionnaire
router.put('/:id/consultation', verifyToken, requireWorker, async (req, res) => {
    try {
        const { doctorConsultation, consultationType, hospitalVisitDetails } = req.body;

        const questionnaire = await Questionnaire.findOne({
            _id: req.params.id,
            submittedBy: req.user.id
        });

        if (!questionnaire) {
            return res.status(404).json({ success: false, message: 'Questionnaire not found.' });
        }

        questionnaire.doctorConsultation = doctorConsultation;
        if (doctorConsultation && consultationType) {
            questionnaire.consultationType = consultationType;
            if (consultationType === 'hospital' && hospitalVisitDetails) {
                questionnaire.hospitalVisitDetails = hospitalVisitDetails;
            }
        } else {
            questionnaire.consultationType = null;
            questionnaire.hospitalVisitDetails = { date: null, time: null, hospitalName: null, location: null };
        }

        await questionnaire.save();
        res.json({ success: true, message: 'Consultation updated successfully.', questionnaire });
    } catch (error) {
        console.error('Update consultation error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get all consultations submitted by this worker
router.get('/worker/consultations', verifyToken, requireWorker, async (req, res) => {
    try {
        const consultations = await Questionnaire.find({
            submittedBy: req.user.id,
            doctorConsultation: true
        })
            .populate('patient', 'fullName phone')
            .sort({ submittedAt: 1 });

        res.json({ success: true, consultations });
    } catch (error) {
        console.error('Get worker consultations error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
