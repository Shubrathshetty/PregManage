const mongoose = require('mongoose');
const dns = require('dns');
const Admin = require('../models/Admin');

// Use Google DNS to resolve MongoDB Atlas hostnames
// (bypasses restrictive network/corporate DNS that may block Atlas)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Ensure Admin exists/Update password for 'admin'
        let defaultAdmin = await Admin.findOne({ username: 'admin' });
        if (!defaultAdmin) {
            defaultAdmin = new Admin({
                username: 'admin',
                password: 'DOC_Admin@465',
                name: 'System Administrator'
            });
            await defaultAdmin.save();
            console.log('👷 Default admin created: admin / DOC_Admin@465');
        } else {
            // Optional: always reset password on restart for simple troubleshooting
            defaultAdmin.password = 'DOC_Admin@465';
            await defaultAdmin.save();
            console.log('✅ Admin user verified & password reset to: DOC_Admin@465');
        }
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

