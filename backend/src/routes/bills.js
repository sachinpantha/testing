const express = require('express');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate bill (Receptionist only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { tableNumber } = req.body;
    const orders = await Order.find({ tableNumber, status: { $in: ['served', 'billed'] } }).populate('items.menuItem');
    
    if (orders.length === 0) {
      return res.status(400).json({ message: 'No served orders for this table' });
    }

    let subtotal = 0;
    const items = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          subtotal += item.menuItem.price * item.quantity;
          items.push({
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
            total: item.menuItem.price * item.quantity
          });
        } else {
          // Use stored price if menuItem is null
          subtotal += item.price * item.quantity;
          items.push({
            name: 'Unknown Item',
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          });
        }
      });
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const bill = new Bill({
      order: orders[0]._id,
      tableNumber,
      subtotal,
      tax,
      total,
      receptionist: req.user.userId
    });

    await bill.save();
    
    // Create transaction
    await Transaction.create({
      tableNumber,
      order: orders[0]._id,
      bill: bill._id,
      waiter: orders[0].waiter,
      receptionist: req.user.userId,
      totalAmount: total
    });

    // Update orders status only if not already billed
    await Order.updateMany({ tableNumber, status: 'served' }, { status: 'billed' });
    // Table will be marked vacant when payment is confirmed

    // Return populated bill
    const populatedBill = await Bill.findById(bill._id).populate('receptionist', 'username').populate({
      path: 'order',
      populate: {
        path: 'items.menuItem',
        model: 'MenuItem'
      }
    });

    res.status(201).json(populatedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get bill details
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('receptionist', 'username').populate({
      path: 'order',
      populate: {
        path: 'items.menuItem',
        model: 'MenuItem'
      }
    });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark payment as complete (Receptionist only)
router.post('/:id/paid', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Mark table as vacant after payment confirmation
    await Table.findOneAndUpdate({ tableNumber: bill.tableNumber }, { status: 'vacant' });
    
    res.json({ message: 'Payment confirmed, table is now vacant' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bills (Super Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bills = await Bill.find().populate('receptionist', 'username').populate({
      path: 'order',
      populate: {
        path: 'items.menuItem',
        model: 'MenuItem'
      }
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;