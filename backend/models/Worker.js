const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    area: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        default: 'worker',
        immutable: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
workerSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
workerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);
