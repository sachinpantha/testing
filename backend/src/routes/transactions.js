const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all transactions (Receptionist only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const transactions = await Transaction.find()
      .populate('billId')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;