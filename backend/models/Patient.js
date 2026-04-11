const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Phone number must be a valid 10-digit Indian mobile number'
        }
    },
    address: {
        street: { type: String, required: true, trim: true },
        taluk: { type: String, required: true, trim: true },
        district: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[1-9]\d{5}$/.test(v);
                },
                message: 'Pincode must be a valid 6-digit code'
            }
        }
    },
    lmpDate: {
        type: Date,
        required: true
    },
    edd: {
        type: Date,
        required: true
    },
    currentMonthOfPregnancy: {
        type: Number,
        required: true,
        min: 1,
        max: 9
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

patientSchema.index({ fullName: 1 });
patientSchema.index({ registeredBy: 1 });
patientSchema.index({ phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);
