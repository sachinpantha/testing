const express = require('express');
const Table = require('../models/Table');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tables
router.get('/', auth, async (req, res) => {
  try {
    const tables = await Table.find({}, 'tableNumber status').sort({ tableNumber: 1 }).lean();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific table
router.get('/:tableNumber', auth, async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber }, 'tableNumber status').lean();
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize tables
router.post('/initialize', async (req, res) => {
  try {
    await Table.deleteMany({});
    const tables = [];
    for (let i = 1; i <= 15; i++) {
      tables.push({ tableNumber: i, status: 'vacant' });
    }
    await Table.insertMany(tables);
    res.json({ message: '15 tables initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;