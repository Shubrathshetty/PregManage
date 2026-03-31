const mongoose = require('mongoose');
const Patient = require('./backend/models/Patient');
const Questionnaire = require('./backend/models/Questionnaire');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const q = await Questionnaire.findOne({ doctorConsultation: true }).populate('patient');
    console.log(q.patient);
    process.exit(0);
}
check();
