const express = require('express');
const Questionnaire = require('../models/Questionnaire');
const Patient = require('../models/Patient');
const { verifyToken, requireWorker } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { questionnaireSchema, consultationSchema } = require('../validators/questionnaireSchema');
const logger = require('../config/logger');

const router = express.Router();

// Submit a questionnaire (Fix #2: validated with questionnaireSchema)
router.post('/', verifyToken, requireWorker, validate(questionnaireSchema), async (req, res) => {
    try {
        const { patientId, answers } = req.body;

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
        logger.info('Questionnaire submitted', { questionnaireId: questionnaire._id, patientId });
        res.status(201).json({ success: true, message: 'Questionnaire submitted successfully.', questionnaire });
    } catch (error) {
        logger.error('Submit questionnaire error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Fix #6: Get questionnaires for a patient with pagination
router.get('/patient/:patientId', verifyToken, requireWorker, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const filter = {
            patient: req.params.patientId,
            submittedBy: req.user.id
        };

        const [questionnaires, totalCount] = await Promise.all([
            Questionnaire.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit),
            Questionnaire.countDocuments(filter)
        ]);

        res.json({
            success: true,
            questionnaires,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        });
    } catch (error) {
        logger.error('Get questionnaires error', { error: error.message });
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
        logger.error('Get questionnaire error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Update doctor consultation (Fix #2: validated with consultationSchema)
router.put('/:id/consultation', verifyToken, requireWorker, validate(consultationSchema), async (req, res) => {
    try {
        const { doctorConsultation, consultationType, hospitalVisitDetails, homeVisitDetails, whatsappNumber } = req.body;

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
                questionnaire.hospitalVisitDetails = {
                    date: hospitalVisitDetails.date || null,
                    time: hospitalVisitDetails.time || null,
                    hospitalName: hospitalVisitDetails.hospitalName || null,
                    location: hospitalVisitDetails.location || null
                };
                questionnaire.homeVisitDetails = { date: null, time: null, location: null };
            } else if (consultationType === 'home' && homeVisitDetails) {
                questionnaire.homeVisitDetails = {
                    date: homeVisitDetails.date || null,
                    time: homeVisitDetails.time || null,
                    location: homeVisitDetails.location || null
                };
                questionnaire.hospitalVisitDetails = { date: null, time: null, hospitalName: null, location: null };
            }

            // Save WhatsApp number if provided
            if (whatsappNumber) {
                questionnaire.whatsappNumber = whatsappNumber;
            }
        } else {
            questionnaire.consultationType = null;
            questionnaire.hospitalVisitDetails = { date: null, time: null, hospitalName: null, location: null };
            questionnaire.homeVisitDetails = { date: null, time: null, location: null };
        }

        // Set scheduledAt based on visit date
        const visitDate = questionnaire.consultationType === 'hospital'
            ? questionnaire.hospitalVisitDetails?.date
            : questionnaire.homeVisitDetails?.date;
        if (visitDate) {
            questionnaire.scheduledAt = new Date(visitDate);
        }

        await questionnaire.save();
        logger.info('Consultation updated', { questionnaireId: req.params.id });
        res.json({ success: true, message: 'Consultation updated successfully.', questionnaire });
    } catch (error) {
        logger.error('Update consultation error', { error: error.message });
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
        logger.error('Get worker consultations error', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
