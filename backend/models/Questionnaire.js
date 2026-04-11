const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    answers: {
        q1_pain_tooth: {
            type: Boolean,
            required: true
        },
        q2_food_lodgement: {
            type: Boolean,
            required: true
        },
        q3_bleeding_gums: {
            type: Boolean,
            required: true
        },
        q4_bad_breath: {
            type: Boolean,
            required: true
        },
        q5_burning_sensation: {
            type: Boolean,
            required: true
        },
        q6_ulcers: {
            type: Boolean,
            required: true
        },
        q7_difficulty_opening_mouth: {
            type: Boolean,
            required: true
        },
        q8_malaigned_teeth: {
            type: Boolean,
            required: true
        },
        q9_missing_teeth: {
            type: Boolean,
            required: true
        }
    },
    doctorConsultation: {
        type: Boolean,
        default: null
    },
    consultationType: {
        type: String,
        enum: ['hospital', null],
        default: null
    },
    consultationStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    completedAt: {
        type: Date,
        default: null
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    hospitalVisitDetails: {
        date: { type: Date, default: null },
        time: { type: String, default: null },
        hospitalName: { type: String, default: null },
        location: { type: String, default: null }
    },
    whatsappNumber: {
        type: String,
        default: null
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

questionnaireSchema.index({ submittedBy: 1 });
questionnaireSchema.index({ consultationType: 1 });
questionnaireSchema.index({ consultationStatus: 1 });

module.exports = mongoose.model('Questionnaire', questionnaireSchema);
