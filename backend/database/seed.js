const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');

// Use Google DNS to resolve MongoDB Atlas hostnames
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Admin = require('../backend/models/Admin');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            existingAdmin.password = 'DOC_Admin@465';
            await existingAdmin.save();
            console.log('✅ Admin password updated successfully!');
            console.log('   Username: admin');
            console.log('   Password: DOC_Admin@465');
            process.exit(0);
        }

        // Create default admin
        const admin = new Admin({
            username: 'admin',
            password: 'DOC_Admin@465',
            name: 'System Administrator'
        });

        await admin.save();
        console.log('✅ Default admin account created successfully!');
        console.log('   Username: admin');
        console.log('   Password: DOC_Admin@465');
        //console.log('   ⚠️  Please change the password after first login.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
