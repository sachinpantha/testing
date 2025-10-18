const express = require('express');
const Order = require('../models/Order');
const Table = require('../models/Table');
const auth = require('../middleware/auth');
const router = express.Router();

// Create order (Waiter only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'waiter') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const order = new Order({ ...req.body, waiter: req.user.userId, status: 'in_kitchen' });
    await order.save();
    const updatedTable = await Table.findOneAndUpdate(
      { tableNumber: req.body.tableNumber }, 
      { status: 'occupied' },
      { new: true }
    );
    
    // Emit real-time updates
    const io = req.app.get('io');
    console.log('Emitting tableUpdated for table:', updatedTable.tableNumber);
    io.emit('tableUpdated', updatedTable);
    console.log('Emitting newOrder for table:', order.tableNumber);
    io.emit('newOrder', order);
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get kitchen orders (Chef only)
router.get('/kitchen', auth, async (req, res) => {
  try {
    if (req.user.role !== 'chef') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const orders = await Order.find({ status: { $in: ['pending', 'in_kitchen', 'ready'] } }).populate('items.menuItem waiter');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Chef only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'chef') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
    // Emit real-time order update
    const io = req.app.get('io');
    console.log('Emitting orderUpdated for order:', order._id);
    io.emit('orderUpdated', order);
    
    // Update table status when order is served
    if (req.body.status === 'served') {
      const updatedTable = await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber }, 
        { status: 'served' },
        { new: true }
      );
      
      // Emit real-time table update
      console.log('Emitting tableUpdated for served table:', updatedTable.tableNumber);
      io.emit('tableUpdated', updatedTable);
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get orders by table (Receptionist and Super Admin)
router.get('/table/:tableNumber', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receptionist' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const orders = await Order.find({ 
      tableNumber: req.params.tableNumber, 
      status: 'served' 
    }).populate('items.menuItem waiter');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Super Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const orders = await Order.find().populate('items.menuItem waiter');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;