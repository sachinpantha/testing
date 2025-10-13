const mongoose = require('mongoose');
require('dotenv').config();

// Suppress deprecation warnings
mongoose.set('strictQuery', false);

const checkMongoDB = async () => {
  console.log('Checking MongoDB Atlas connection...\n');

  try {
    console.log('Trying MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Atlas is accessible!');
    console.log('Connection successful to MongoDB Atlas');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    console.log('\n🚨 MongoDB Atlas is not accessible.');
    console.log('\nPlease check:');
    console.log('1. Your internet connection');
    console.log('2. MongoDB Atlas cluster is running');
    console.log('3. Connection string and credentials are correct');
    process.exit(1);
  }
};

checkMongoDB();