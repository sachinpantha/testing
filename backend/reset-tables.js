const mongoose = require('mongoose');
const Table = require('./models/Table');
require('dotenv').config();

// Suppress deprecation warnings
mongoose.set('strictQuery', false);

const resetTables = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB Atlas');

    // Force reset all tables to vacant
    const result = await Table.updateMany(
      {}, 
      { 
        $set: { 
          status: 'vacant', 
          currentOrder: null 
        } 
      }
    );
    
    console.log(`✅ Reset ${result.modifiedCount} tables to vacant status`);
    
    // Verify the reset
    const tables = await Table.find({});
    console.log('\nTable Status After Reset:');
    tables.forEach(table => {
      console.log(`Table ${table.tableNumber}: ${table.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error);
    process.exit(1);
  }
};

resetTables();