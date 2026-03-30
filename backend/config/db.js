const mongoose = require('mongoose');
const dns = require('dns');
const Admin = require('../models/Admin');
const logger = require('./logger');

// Use Google DNS to resolve MongoDB Atlas hostnames
// (bypasses restrictive network/corporate DNS that may block Atlas)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

        // Ensure Admin exists
        let defaultAdmin = await Admin.findOne({ username: 'admin' });
        if (!defaultAdmin) {
            if (!defaultPassword) {
                logger.warn('⚠️ No DEFAULT_ADMIN_PASSWORD set in .env — skipping default admin creation.');
                return;
            }
            defaultAdmin = new Admin({
                username: 'admin',
                password: defaultPassword,
                name: 'System Administrator'
            });
            await defaultAdmin.save();
            logger.info('👷 Default admin created (username: admin)');
        } else if (defaultPassword) {
            // Reset password to env var value (for dev/troubleshooting only)
            defaultAdmin.password = defaultPassword;
            await defaultAdmin.save();
            logger.info('✅ Admin user verified & password synced from .env');
        } else {
            logger.info('✅ Admin user exists. No password reset (DEFAULT_ADMIN_PASSWORD not set).');
        }
    } catch (error) {
        logger.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
