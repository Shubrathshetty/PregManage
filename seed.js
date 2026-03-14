const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

// Use Google DNS to resolve MongoDB Atlas hostnames
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            existingAdmin.password = 'Doc_admin@998';
            await existingAdmin.save();
            console.log('✅ Admin password updated successfully!');
            console.log('   Username: admin');
            console.log('   Password: Doc_admin@998');
            process.exit(0);
        }

        // Create default admin
        const admin = new Admin({
            username: 'admin',
            password: 'Doc_admin@998',
            name: 'System Administrator'
        });

        await admin.save();
        console.log('✅ Default admin account created successfully!');
        console.log('   Username: admin');
        console.log('   Password: Doc_admin@998');
        //console.log('   ⚠️  Please change the password after first login.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
