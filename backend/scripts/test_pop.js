const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Questionnaire = require('../models/Questionnaire');
require('dotenv').config({ path: '../.env' });

async function check() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');
        
        const q = await Questionnaire.findOne({ doctorConsultation: true }).populate('patient');
        if (q) {
            console.log('Found consultation for patient:', q.patient.fullName);
        } else {
            console.log('No consultations found.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
check();
