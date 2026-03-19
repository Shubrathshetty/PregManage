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
    husbandName: {
        type: String,
        required: true,
        trim: true
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
        village: { type: String, required: true, trim: true },
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
    aadhaar: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[2-9]\d{11}$/.test(v);
            },
            message: 'Aadhaar must be a valid 12-digit number (cannot start with 0 or 1)'
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
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    gravida: {
        type: Number,
        required: true
    },
    para: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
        default: null
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

module.exports = mongoose.model('Patient', patientSchema);
