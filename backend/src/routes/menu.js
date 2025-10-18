const express = require('express');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const router = express.Router();

// Get all menu items
router.get('/', cacheMiddleware('menu'), async (req, res) => {
  try {
    const menuItems = await MenuItem.find({}, 'name category price description').lean();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create menu item (Super Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    clearCache('menu');
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item (Super Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    clearCache('menu');
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete menu item (Super Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await MenuItem.findByIdAndDelete(req.params.id);
    clearCache('menu');
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;