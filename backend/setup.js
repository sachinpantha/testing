const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const MenuItem = require('./src/models/MenuItem');
const Table = require('./src/models/Table');
const connectDB = require('./src/config/database');
require('dotenv').config();

// Suppress deprecation warnings
mongoose.set('strictQuery', false);

const setupDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();
    console.log('Connected to MongoDB Atlas');

    // Create Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'super_admin'
    });

    try {
      await superAdmin.save();
      console.log('Super Admin created: username=admin, password=admin123');
    } catch (error) {
      if (error.code === 11000) {
        console.log('Super Admin already exists');
      }
    }

    // Create sample users
    const sampleUsers = [
      { username: 'waiter1', password: 'waiter123', role: 'waiter' },
      { username: 'chef1', password: 'chef123', role: 'chef' },
      { username: 'receptionist1', password: 'reception123', role: 'receptionist' }
    ];

    for (const userData of sampleUsers) {
      const hashedPass = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        password: hashedPass,
        role: userData.role
      });

      try {
        await user.save();
        console.log(`${userData.role} created: username=${userData.username}, password=${userData.password}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`${userData.username} already exists`);
        }
      }
    }

    // Create sample menu items
    const menuItems = [
      { name: 'Chicken Burger', category: 'Main Course', price: 12.99, description: 'Grilled chicken with lettuce and tomato' },
      { name: 'Caesar Salad', category: 'Salads', price: 8.99, description: 'Fresh romaine lettuce with caesar dressing' },
      { name: 'Margherita Pizza', category: 'Main Course', price: 14.99, description: 'Classic pizza with tomato and mozzarella' },
      { name: 'Coca Cola', category: 'Beverages', price: 2.99, description: 'Refreshing soft drink' },
      { name: 'Coffee', category: 'Beverages', price: 3.99, description: 'Freshly brewed coffee' },
      { name: 'Chocolate Cake', category: 'Desserts', price: 6.99, description: 'Rich chocolate cake with cream' },
      { name: 'Fish & Chips', category: 'Main Course', price: 15.99, description: 'Battered fish with crispy fries' },
      { name: 'Orange Juice', category: 'Beverages', price: 3.49, description: 'Fresh squeezed orange juice' }
    ];

    for (const item of menuItems) {
      try {
        const menuItem = new MenuItem(item);
        await menuItem.save();
        console.log(`Menu item created: ${item.name}`);
      } catch (error) {
        console.log(`Menu item ${item.name} might already exist`);
      }
    }

    // Create tables (1-15)
    const existingTables = await Table.countDocuments();
    if (existingTables === 0) {
      const tables = [];
      for (let i = 1; i <= 15; i++) {
        tables.push({ tableNumber: i });
      }
      await Table.insertMany(tables);
      console.log('15 tables created');
    } else {
      console.log('Tables already exist');
    }

    // Reset all tables to vacant status
    await Table.updateMany({}, { status: 'vacant', currentOrder: null });
    console.log('All tables reset to vacant status');

    console.log('\n=== SETUP COMPLETE ===');
    console.log('Login credentials:');
    console.log('Super Admin - username: admin, password: admin123');
    console.log('Waiter - username: waiter1, password: waiter123');
    console.log('Chef - username: chef1, password: chef123');
    console.log('Receptionist - username: receptionist1, password: reception123');
    
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

setupDatabase();