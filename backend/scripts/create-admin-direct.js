const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const Admin = require('../models/Admin');

// Use Google DNS to resolve MongoDB Atlas hostnames
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function createAdmin() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      existingAdmin.password = 'DOC_Admin@465';
      await existingAdmin.save();
      console.log('Admin password updated to: DOC_Admin@465');
    } else {
      const admin = new Admin({
        username: 'admin',
        password: 'DOC_Admin@465',
        name: 'System Administrator'
      });
      await admin.save();
      console.log('Admin created: admin / DOC_Admin@465');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createAdmin();
