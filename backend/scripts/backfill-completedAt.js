// Backfill completedAt for existing completed consultations
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Questionnaire = require('../models/Questionnaire');

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Questionnaire.updateMany(
        { consultationStatus: 'Completed', completedAt: null },
        { $set: { completedAt: new Date() } }
    );
    
    console.log(`Backfilled ${result.modifiedCount} records with completedAt = now`);
    await mongoose.disconnect();
    console.log('Done');
})();
