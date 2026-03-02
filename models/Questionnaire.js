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
        q1_bleeding: {
            type: Boolean,
            required: true
        },
        q2_headache_vision: {
            type: Boolean,
            required: true
        },
        q3_swelling: {
            type: Boolean,
            required: true
        },
        q4_nausea_vomiting: {
            type: Boolean,
            required: true
        },
        q5_fetal_movement: {
            type: Boolean,
            required: true
        },
        q6_abdominal_pain: {
            type: Boolean,
            required: true
        },
        q7_fever_chills: {
            type: Boolean,
            required: true
        },
        q8_breathing_chest: {
            type: Boolean,
            required: true
        },
        q9_supplements: {
            type: Boolean,
            required: true
        },
        q10_checkup: {
            type: Boolean,
            required: true
        }
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Questionnaire', questionnaireSchema);
