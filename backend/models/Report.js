const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        trim: true,
        description: 'Email or Phone number of the user reporting the issue'
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Resolved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);
