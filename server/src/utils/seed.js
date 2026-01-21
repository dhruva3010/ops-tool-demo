require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('Admin user already exists, deleting and recreating...');
      await User.deleteOne({ email: 'admin@example.com' });
    }

    // Create admin user - password will be hashed by the model's pre-save hook
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      department: 'IT',
      authProvider: 'local',
      isActive: true,
      mustChangePassword: true,
    });

    console.log('Admin user created:', admin.email);
    console.log('Password: admin123');
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();
